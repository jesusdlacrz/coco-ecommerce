import type { PageServerLoad } from './$types';
import { loadVendorProduct } from '$lib/pricing/catalog.server';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const product = await loadVendorProduct(params.slug, params.id, fetch);

	if (!product) {
		throw error(404, 'Producto no encontrado');
	}

	return { product };
};
