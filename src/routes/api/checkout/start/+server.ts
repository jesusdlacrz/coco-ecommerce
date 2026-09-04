import { json, error } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import type { CartItem } from '$lib/shared/model/products';
import { SHIPPING_COST } from '$lib/shared/utils/price';
import { MIN_PAYMENT_UNITS } from '$lib/cart/stores/cartStore';
import { getHouseCartPrices, getVendorCartPrices, getCartStock } from '$lib/pricing/catalog.server';
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
			customer.state?.trim() &&
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
	// Cantidades negativas o no enteras dejarían manipular el monto cobrado
	// (una línea negativa resta del subtotal aunque el total de unidades siga
	// cumpliendo el mínimo) — se rechaza el carrito completo antes de calcular nada.
	const hasInvalidQuantity = items.some(
		(item) => !Number.isInteger(item.quantity) || item.quantity <= 0
	);
	if (hasInvalidQuantity) {
		throw error(400, 'Hay una cantidad inválida en el carrito.');
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

	// Nunca se confía en que el navegador haya bloqueado bien una talla/color
	// agotado — se revalida contra el stock real de cada variación antes de
	// generar la firma y cobrar. La cantidad del cliente se puede saltar con
	// curl igual que el precio.
	const stockLevels = await getCartStock(
		verifiedItems.map((item) => ({ productId: item.productId, size: item.size, color: item.color })),
		fetch
	);
	verifiedItems.forEach((item, index) => {
		if (item.quantity > stockLevels[index]) {
			const variant = [item.size, item.color].filter(Boolean).join(' / ');
			throw error(
				409,
				`No hay suficiente stock de "${item.name}"${variant ? ` (${variant})` : ''}. Actualiza tu carrito.`
			);
		}
	});

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
