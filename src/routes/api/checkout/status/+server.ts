import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPendingCheckout } from '$lib/server/checkout/repository';

export const GET: RequestHandler = async ({ url }) => {
	const reference = url.searchParams.get('reference');
	if (!reference) {
		throw error(400, 'Falta la referencia');
	}
	const checkout = await getPendingCheckout(reference);
	if (!checkout) {
		throw error(404, 'Referencia no encontrada');
	}
	return json({ status: checkout.status, wooOrderId: checkout.wooOrderId });
};
