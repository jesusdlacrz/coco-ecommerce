import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SHIPPING_COST } from '$lib/shared/utils/price';
import { getWompiConfig } from '$lib/server/wompi/config';
import { verifyEventChecksum } from '$lib/server/wompi/signature';
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
// métodos async (PSE, transferencia) mandan primero un evento PENDING y
// después el definitivo — tratarlo como declinado bloquearía para siempre el
// evento APPROVED real que llega después (la fila ya no estaría en 'pending').
type WompiTerminalStatus = 'DECLINED' | 'VOIDED' | 'ERROR';

interface WompiTransaction {
	id: string;
	reference: string;
	status: 'APPROVED' | WompiTerminalStatus | 'PENDING';
	amount_in_cents: number;
}

interface WompiWebhookPayload {
	event: string;
	data: { transaction: WompiTransaction };
	signature: { properties: string[]; checksum: string };
	timestamp: number;
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
		const meta = [
			...(item.color ? [{ key: 'Color', value: item.color }] : []),
			...(item.size ? [{ key: 'Talla', value: item.size }] : [])
		];
		const target = targetByKey.get(itemKey(item));
		if (!target) {
			throw new Error(`No se pudo resolver el producto/variación de "${item.productId}" en WooCommerce`);
		}
		return {
			productId: target.productId,
			variationId: target.variationId,
			quantity: item.quantity,
			total: (item.price * item.quantity).toFixed(2),
			meta
		};
	});
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	const wompi = getWompiConfig();
	if (!wompi) {
		// 500 (no 200): si Wompi no está configurado en este ambiente, queremos
		// que Wompi reintente en vez de dar por entregado un evento que nunca
		// se procesó — un 200 aquí perdería confirmaciones de pago reales para
		// siempre en cuanto se corrija la configuración.
		console.error('[wompi-webhook] Evento recibido pero Wompi no está configurado.');
		throw error(500, 'Wompi no está configurado');
	}

	const payload = (await request.json()) as WompiWebhookPayload;

	if (!verifyEventChecksum(payload, wompi.eventsSecret)) {
		throw error(400, 'Firma inválida');
	}

	// Solo nos interesan las actualizaciones de transacción; cualquier otro
	// evento se reconoce sin procesar.
	if (payload.event !== 'transaction.updated') {
		return json({ ok: true });
	}

	const { transaction } = payload.data;

	// Estado intermedio (ej. PSE/transferencia todavía procesando) — no hay
	// nada que resolver aún, el evento definitivo llega después.
	if (transaction.status === 'PENDING') {
		return json({ ok: true });
	}

	if (transaction.status !== 'APPROVED') {
		const checkout = await getPendingCheckout(transaction.reference);
		if (checkout?.status === 'pending') {
			await markCheckoutResolved(transaction.reference, 'declined', null);
		}
		return json({ ok: true });
	}

	// Reclamo atómico: si dos entregas del mismo webhook llegan casi a la vez
	// (Wompi reintenta si no responde 200 rápido), solo una de ellas logra
	// pasar de 'pending' a 'processing' — la otra ve claimed=false y no crea
	// un segundo pedido en WooCommerce para el mismo pago.
	const claimed = await claimPendingCheckout(transaction.reference);
	if (!claimed) {
		return json({ ok: true });
	}

	const checkout = await getPendingCheckout(transaction.reference);
	if (!checkout) {
		console.warn(`[wompi-webhook] Referencia desconocida: ${transaction.reference}`);
		return json({ ok: true });
	}

	try {
		const lineItems = await buildLineItems(checkout, fetch);
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
					postalCode: checkout.customer.postalCode,
					country: checkout.customer.country
				}
			},
			fetch
		);
		await markCheckoutResolved(transaction.reference, 'approved', order.id);
	} catch (err) {
		// Se libera de vuelta a 'pending' (no se queda atascada en
		// 'processing') para que el próximo reintento de Wompi pueda
		// reclamarla e intentar de nuevo, en vez de perder la venta.
		await releasePendingCheckout(transaction.reference);
		console.error(
			`[wompi-webhook] Error creando el pedido para "${transaction.reference}" (${describeError(err)}).`
		);
		throw error(500, 'No se pudo crear el pedido');
	}

	return json({ ok: true });
};
