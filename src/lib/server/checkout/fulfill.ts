// Convierte una transacción de Wompi en el pedido de WooCommerce. La usan dos
// caminos: el webhook (Wompi avisa) y la consulta de estado de la página de
// confirmación (le preguntamos a Wompi nosotros), para que el pedido se cree
// aunque la URL de eventos no esté configurada o el aviso no llegue.
import { SHIPPING_COST } from '$lib/shared/utils/price';
import type { WompiConfig } from '$lib/server/wompi/config';
import {
	getPendingCheckout,
	claimPendingCheckout,
	releasePendingCheckout,
	markCheckoutResolved,
	type PendingCheckout
} from '$lib/server/checkout/repository';
import {
	createOrder,
	resolveOrderTarget,
	type CreateOrderLineItem
} from '$lib/shared/services/woocommerce.server';
import { describeError } from '$lib/shared/utils/describeError';

// Estados terminales negativos de Wompi. 'PENDING' NO está aquí a propósito:
// métodos async (PSE, transferencia) pasan primero por PENDING y después
// llegan al definitivo — tratarlo como declinado bloquearía para siempre el
// APPROVED real que llega después (la fila ya no estaría en 'pending').
type WompiTerminalStatus = 'DECLINED' | 'VOIDED' | 'ERROR';

export interface WompiTransaction {
	id: string;
	reference: string;
	status: 'APPROVED' | WompiTerminalStatus | 'PENDING';
	amount_in_cents: number;
}

// Misma combinación producto+talla+color no debe resolverse dos veces contra
// WooCommerce aunque aparezca en más de una línea del carrito.
function itemKey(item: { productId: string; size: string | null; color: string | null }): string {
	return `${item.productId}::${item.size ?? ''}::${item.color ?? ''}`;
}

async function buildLineItems(
	checkout: PendingCheckout,
	fetchFn: typeof fetch
): Promise<CreateOrderLineItem[]> {
	const uniqueItems = new Map<string, { productId: string; size: string | null; color: string | null }>();
	for (const item of checkout.items) {
		uniqueItems.set(itemKey(item), { productId: item.productId, size: item.size, color: item.color });
	}
	const resolvedPairs = await Promise.all(
		[...uniqueItems.entries()].map(
			async ([key, { productId, size, color }]) =>
				[key, await resolveOrderTarget(productId, size, color, fetchFn)] as const
		)
	);
	const targetByKey = new Map(resolvedPairs);

	return checkout.items.map((item) => {
		const target = targetByKey.get(itemKey(item));
		if (!target) {
			throw new Error(`No se pudo resolver el producto/variación de "${item.productId}" en WooCommerce`);
		}
		// Con variación, WooCommerce ya muestra talla y color desde sus atributos:
		// repetirlos como meta los duplicaba en el pedido. Solo hacen falta en
		// productos simples, donde no hay variación que los lleve.
		const meta = target.variationId
			? []
			: [
					...(item.color ? [{ key: 'Color', value: item.color }] : []),
					...(item.size ? [{ key: 'Talla', value: item.size }] : [])
				];
		return {
			productId: target.productId,
			variationId: target.variationId,
			quantity: item.quantity,
			total: (item.price * item.quantity).toFixed(2),
			meta
		};
	});
}

/**
 * Aplica el estado de una transacción de Wompi al checkout pendiente: crea el
 * pedido si fue aprobada, la marca declinada si no. Idempotente — se puede
 * llamar varias veces (y en paralelo desde webhook y consulta) para la misma
 * referencia sin duplicar pedidos. Lanza si crear el pedido falla, dejando la
 * fila en 'pending' para que un próximo intento lo reintente.
 */
export async function applyWompiTransaction(
	transaction: WompiTransaction,
	fetchFn: typeof fetch
): Promise<void> {
	// Estado intermedio (ej. PSE/transferencia todavía procesando) — no hay
	// nada que resolver aún.
	if (transaction.status === 'PENDING') return;

	if (transaction.status !== 'APPROVED') {
		const checkout = await getPendingCheckout(transaction.reference);
		if (checkout?.status === 'pending') {
			await markCheckoutResolved(transaction.reference, 'declined', null);
		}
		return;
	}

	// Reclamo atómico: si webhook y consulta (o dos reintentos del webhook)
	// llegan casi a la vez, solo uno logra pasar de 'pending' a 'processing'
	// — el otro ve claimed=false y no crea un segundo pedido para el mismo pago.
	const claimed = await claimPendingCheckout(transaction.reference);
	if (!claimed) return;

	const checkout = await getPendingCheckout(transaction.reference);
	if (!checkout) {
		console.warn(`[wompi] Referencia desconocida: ${transaction.reference}`);
		return;
	}

	// La firma de integridad ya amarra el monto a la referencia, pero si por
	// cualquier motivo Wompi aprobó un monto distinto al calculado, no se crea
	// el pedido: queda en el log para revisarlo a mano en el panel de Wompi.
	if (transaction.amount_in_cents !== checkout.amountInCents) {
		await markCheckoutResolved(transaction.reference, 'declined', null);
		console.error(
			`[wompi] Monto distinto para "${transaction.reference}": Wompi cobró ${transaction.amount_in_cents}, se esperaba ${checkout.amountInCents}.`
		);
		return;
	}

	try {
		const lineItems = await buildLineItems(checkout, fetchFn);
		const order = await createOrder(
			{
				reference: transaction.reference,
				vendorSlug: checkout.vendorSlug,
				lineItems,
				shippingTotal: SHIPPING_COST.toFixed(2),
				billing: {
					firstName: checkout.customer.firstName,
					lastName: checkout.customer.lastName,
					email: checkout.customer.email,
					phone: checkout.customer.phone,
					address: checkout.customer.address,
					addressComplement: checkout.customer.addressComplement,
					dwellingType: checkout.customer.dwellingType,
					city: checkout.customer.city,
					state: checkout.customer.state,
					postalCode: checkout.customer.postalCode,
					country: checkout.customer.country
				}
			},
			fetchFn
		);
		await markCheckoutResolved(transaction.reference, 'approved', order.id);
	} catch (err) {
		// Se libera de vuelta a 'pending' (no se queda atascada en
		// 'processing') para que el próximo intento pueda reclamarla de nuevo,
		// en vez de perder la venta.
		await releasePendingCheckout(transaction.reference);
		console.error(
			`[wompi] Error creando el pedido para "${transaction.reference}" (${describeError(err)}).`
		);
		throw err;
	}
}

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Le pregunta a Wompi en qué quedó el pago de una referencia (con la llave
 * privada) y lo aplica. Respaldo del webhook: no lanza nunca, porque se llama
 * desde la consulta de estado y un fallo aquí solo significa "reintentar en
 * el próximo tick".
 */
export async function reconcileWithWompi(
	reference: string,
	wompi: WompiConfig,
	fetchFn: typeof fetch
): Promise<void> {
	const baseUrl = wompi.isSandbox ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1';
	try {
		const res = await fetchFn(`${baseUrl}/transactions?reference=${encodeURIComponent(reference)}`, {
			headers: { Authorization: `Bearer ${wompi.privateKey}` },
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
		});
		if (!res.ok) {
			throw new Error(`transactions ${res.status}: ${await res.text()}`);
		}
		const { data } = (await res.json()) as { data: WompiTransaction[] };
		// Por si una referencia tuviera varios intentos: si alguno se aprobó, ese
		// manda; si alguno sigue pendiente, todavía no se marca como declinada.
		const approved = data.find((t) => t.status === 'APPROVED');
		if (approved) return await applyWompiTransaction(approved, fetchFn);
		if (data.length === 0 || data.some((t) => t.status === 'PENDING')) return;
		await applyWompiTransaction(data[0], fetchFn);
	} catch (err) {
		console.error(`[wompi] No se pudo consultar "${reference}" en Wompi (${describeError(err)}).`);
	}
}
