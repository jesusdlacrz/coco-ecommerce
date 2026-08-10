import type { PageServerLoad } from './$types';
import { getProduct } from '$lib/shared/services/woocommerce.server';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const product = await getProduct(params.id, fetch);

	if (!product) {
		throw error(404, 'Producto no encontrado');
	}

	return { product };
};
