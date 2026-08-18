import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SHIPPING_COST } from '$lib/shared/utils/price';
import { getWompiConfig } from '$lib/server/wompi/config';
import { verifyEventChecksum } from '$lib/server/wompi/signature';
import {
	getPendingCheckout,
	markCheckoutResolved,
	type PendingCheckout
} from '$lib/server/checkout/repository';
import {
	createOrder,
	resolveWooProductId,
	type CreateOrderLineItem
} from '$lib/shared/services/woocommerce.server';
import { describeError } from '$lib/shared/utils/describeError';

interface WompiTransaction {
	id: string;
	reference: string;
	status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
	amount_in_cents: number;
}

interface WompiWebhookPayload {
	event: string;
	data: { transaction: WompiTransaction };
	signature: { properties: string[]; checksum: string };
	timestamp: number;
}

async function buildLineItems(
	checkout: PendingCheckout,
	fetchFn: typeof fetch
): Promise<CreateOrderLineItem[]> {
	const productIdCache = new Map<string, number>();
	const lineItems: CreateOrderLineItem[] = [];
	for (const item of checkout.items) {
		let wooProductId = productIdCache.get(item.productId);
		if (wooProductId === undefined) {
			wooProductId = await resolveWooProductId(item.productId, fetchFn);
			productIdCache.set(item.productId, wooProductId);
		}
		const meta = [
			...(item.color ? [{ key: 'Color', value: item.color }] : []),
			...(item.size ? [{ key: 'Talla', value: item.size }] : [])
		];
		lineItems.push({
			productId: wooProductId,
			quantity: item.quantity,
			total: (item.price * item.quantity).toFixed(2),
			meta
		});
	}
	return lineItems;
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	const wompi = getWompiConfig();
	if (!wompi) {
		console.error('[wompi-webhook] Evento recibido pero Wompi no está configurado.');
		return json({ ok: true });
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
	const checkout = await getPendingCheckout(transaction.reference);
	if (!checkout) {
		console.warn(`[wompi-webhook] Referencia desconocida: ${transaction.reference}`);
		return json({ ok: true });
	}

	// Idempotencia: Wompi puede reenviar el mismo evento varias veces.
	if (checkout.status !== 'pending') {
		return json({ ok: true });
	}

	if (transaction.status !== 'APPROVED') {
		await markCheckoutResolved(transaction.reference, 'declined', null);
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
		// No se marca como resuelto: si Wompi reintenta el webhook, se vuelve a
		// intentar crear el pedido en vez de perder la venta silenciosamente.
		console.error(
			`[wompi-webhook] Error creando el pedido para "${transaction.reference}" (${describeError(err)}).`
		);
		throw error(500, 'No se pudo crear el pedido');
	}

	return json({ ok: true });
};
