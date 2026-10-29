import { json, error } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import type { CartItem } from '$lib/shared/model/products';
import { SHIPPING_COST } from '$lib/shared/utils/price';
import { productsBelowMinimum, describeShortfalls } from '$lib/cart/stores/cartStore';
import { getHouseCartPrices, getVendorCartPrices, getCartStock } from '$lib/pricing/catalog.server';
import { getWompiConfig } from '$lib/server/wompi/config';
import { buildIntegritySignature } from '$lib/server/wompi/signature';
import {
	createPendingCheckout,
	getReservedQuantities,
	stockKey,
	type CheckoutCustomer
} from '$lib/server/checkout/repository';
import { withMutex, MutexBusyError } from '$lib/server/db/mutex';

const CURRENCY = 'COP';

interface StartCheckoutBody {
	items: CartItem[];
	customer: CheckoutCustomer;
	vendorSlug: string | null;
}

function isValidCustomer(customer: CheckoutCustomer | undefined): customer is CheckoutCustomer {
	return Boolean(
		customer?.firstName?.trim() &&
			customer.lastName?.trim() &&
			customer.email?.trim() &&
			customer.phone?.trim() &&
			customer.address?.trim() &&
			customer.city?.trim() &&
			customer.state?.trim() &&
			customer.dwellingType?.trim() &&
			customer.country?.trim()
	);
}

// Consulta WordPress (lento en el hosting compartido) y, al pagar, crea el
// pedido: los 10 s por defecto de Vercel no siempre alcanzan.
export const config = { maxDuration: 30 };

export const POST: RequestHandler = async ({ request, fetch }) => {
	const wompi = getWompiConfig();
	if (!wompi) {
		throw error(503, 'Wompi no está configurado todavía.');
	}

	const body = (await request.json()) as Partial<StartCheckoutBody>;
	const items = body.items ?? [];
	const vendorSlug = body.vendorSlug ?? null;

	if (items.length === 0) {
		throw error(400, 'El carrito está vacío.');
	}
	// Cantidades negativas o no enteras dejarían manipular el monto cobrado
	// (una línea negativa resta del subtotal aunque el total de unidades siga
	// cumpliendo el mínimo) — se rechaza el carrito completo antes de calcular nada.
	const hasInvalidQuantity = items.some(
		(item) => !Number.isInteger(item.quantity) || item.quantity <= 0
	);
	if (hasInvalidQuantity) {
		throw error(400, 'Hay una cantidad inválida en el carrito.');
	}
	const shortfalls = productsBelowMinimum(items);
	if (shortfalls.length > 0) {
		throw error(400, describeShortfalls(shortfalls));
	}
	if (!isValidCustomer(body.customer)) {
		throw error(400, 'Faltan datos de contacto o envío.');
	}
	const customer = body.customer;

	// Nunca se confía en item.price del cliente: se recalcula contra el
	// catálogo real, por talla/color (pueden tener precios distintos), con la
	// comisión vigente del vendedor si aplica.
	const priceChecks = items.map(({ productId, size, color }) => ({ productId, size, color }));
	const verifiedPrices = vendorSlug
		? await getVendorCartPrices(vendorSlug, priceChecks, fetch)
		: await getHouseCartPrices(priceChecks, fetch);

	const verifiedItems: CartItem[] = [];
	for (const [index, item] of items.entries()) {
		const price = verifiedPrices[index];
		if (price === null || price === undefined) {
			throw error(409, `"${item.name}" ya no está disponible. Actualiza tu carrito.`);
		}
		verifiedItems.push({ ...item, price });
	}

	const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const total = subtotal + SHIPPING_COST;
	const amountInCents = Math.round(total * 100);
	const reference = randomUUID();

	// Stock: revisar y APARTAR tiene que ser atómico entre compradores. Si
	// dos personas pagan a la vez las últimas 4 unidades, sin esto ambas pasan
	// la validación (el stock solo baja cuando Wompi aprueba) y se venden 8.
	//
	// 1. Stock fresco de WordPress (no el de la caché), FUERA del candado: tarda
	//    segundos en el hosting y no debe hacer esperar a otros compradores.
	// 2. Dentro del candado (rápido, solo la base): restar lo apartado por otros
	//    pagos en curso y los aprobados después de la lectura del paso 1 (que
	//    ese número todavía no refleja); si alcanza, apartar creando el pago
	//    pendiente. Las reservas vencen solas (RESERVATION_MS).
	// Nunca se confía en la cantidad del navegador: se puede saltar con curl.
	const stockReadAt = Date.now();
	const stockLevels = await getCartStock(
		verifiedItems.map((item) => ({ productId: item.productId, size: item.size, color: item.color })),
		fetch,
		{ fresh: true }
	);
	try {
		await withMutex('checkout-stock', async () => {
			const reserved = await getReservedQuantities({
				excludeEmail: customer.email,
				approvedSince: stockReadAt
			});
			verifiedItems.forEach((item, index) => {
				const heldByOthers = reserved.get(stockKey(item.productId, item.size, item.color)) ?? 0;
				const available = stockLevels[index] - heldByOthers;
				if (item.quantity <= available) return;
				const variant = [item.size, item.color].filter(Boolean).join(' / ');
				const label = `"${item.name}"${variant ? ` (${variant})` : ''}`;
				throw error(
					409,
					item.quantity <= stockLevels[index]
						? `Otro cliente está pagando las últimas unidades de ${label}. Si no completa el pago, se liberan en unos minutos.`
						: `No hay suficiente stock de ${label}. Actualiza tu carrito.`
				);
			});

			await createPendingCheckout({
				reference,
				vendorSlug,
				items: verifiedItems,
				customer,
				amountInCents
			});
		});
	} catch (err) {
		if (err instanceof MutexBusyError) {
			throw error(503, 'Hay muchas personas pagando en este momento. Intenta de nuevo en unos segundos.');
		}
		throw err;
	}

	const signature = buildIntegritySignature(reference, amountInCents, CURRENCY, wompi.integritySecret);

	return json({
		reference,
		signature,
		amountInCents,
		currency: CURRENCY,
		publicKey: wompi.publicKey
	});
};
