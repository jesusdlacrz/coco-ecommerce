import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPendingCheckout } from '$lib/server/checkout/repository';
import { reconcileWithWompi } from '$lib/server/checkout/fulfill';
import { getWompiConfig } from '$lib/server/wompi/config';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const reference = url.searchParams.get('reference');
	if (!reference) {
		throw error(400, 'Falta la referencia');
	}
	let checkout = await getPendingCheckout(reference);
	if (!checkout) {
		throw error(404, 'Referencia no encontrada');
	}

	// Respaldo del webhook: mientras no esté aprobado, se le pregunta a Wompi
	// directamente. Así el pedido se crea aunque la URL de eventos no esté
	// configurada en Wompi o su aviso no haya llegado todavía. 'declined'
	// entra porque un intento rechazado puede reintentarse con la misma
	// referencia y aprobarse después.
	const wompi = getWompiConfig();
	if ((checkout.status === 'pending' || checkout.status === 'declined') && wompi) {
		await reconcileWithWompi(reference, wompi, fetch);
		checkout = (await getPendingCheckout(reference)) ?? checkout;
	}

	// El número de pedido de WooCommerce no se expone: es consecutivo y
	// revelaría cuántas ventas tiene la tienda.
	return json({ status: checkout.status });
};
