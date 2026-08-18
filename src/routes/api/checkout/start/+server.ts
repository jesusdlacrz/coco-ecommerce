import { json, error } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import type { CartItem } from '$lib/shared/model/products';
import { SHIPPING_COST } from '$lib/shared/utils/price';
import { MIN_PAYMENT_UNITS } from '$lib/cart/stores/cartStore';
import { getHouseCartPrices, getVendorCartPrices } from '$lib/pricing/catalog.server';
import { getWompiConfig } from '$lib/server/wompi/config';
import { buildIntegritySignature } from '$lib/server/wompi/signature';
import { createPendingCheckout, type CheckoutCustomer } from '$lib/server/checkout/repository';

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
			customer.dwellingType?.trim() &&
			customer.country?.trim()
	);
}

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
	const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
	if (totalUnits < MIN_PAYMENT_UNITS) {
		throw error(400, `El pedido mínimo es de ${MIN_PAYMENT_UNITS} unidades.`);
	}
	if (!isValidCustomer(body.customer)) {
		throw error(400, 'Faltan datos de contacto o envío.');
	}
	const customer = body.customer;

	// Nunca se confía en item.price del cliente: se recalcula contra el
	// catálogo real (con la comisión vigente del vendedor, si aplica).
	const productIds = items.map((item) => item.productId);
	const verifiedPrices = vendorSlug
		? await getVendorCartPrices(vendorSlug, productIds, fetch)
		: await getHouseCartPrices(productIds, fetch);

	const verifiedItems: CartItem[] = [];
	for (const item of items) {
		const price = verifiedPrices[item.productId];
		if (price === null || price === undefined) {
			throw error(409, `"${item.name}" ya no está disponible. Actualiza tu carrito.`);
		}
		verifiedItems.push({ ...item, price });
	}

	const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const total = subtotal + SHIPPING_COST;
	const amountInCents = Math.round(total * 100);

	const reference = randomUUID();
	await createPendingCheckout({
		reference,
		vendorSlug,
		items: verifiedItems,
		customer,
		amountInCents
	});

	const signature = buildIntegritySignature(reference, amountInCents, CURRENCY, wompi.integritySecret);

	return json({
		reference,
		signature,
		amountInCents,
		currency: CURRENCY,
		publicKey: wompi.publicKey
	});
};
