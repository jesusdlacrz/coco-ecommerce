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
	// El número de pedido de WooCommerce no se expone: es consecutivo y
	// revelaría cuántas ventas tiene la tienda.
	return json({ status: checkout.status });
};
