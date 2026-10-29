import type { PageServerLoad } from './$types';
import { PUBLIC_PAGE_CACHE } from '$lib/server/http';
import { loadVendorProduct } from '$lib/pricing/catalog.server';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const product = await loadVendorProduct(params.slug, params.id, fetch);

	if (!product) {
		throw error(404, 'Producto no encontrado');
	}

	setHeaders(PUBLIC_PAGE_CACHE);
	return { product };
};
