import type { PageServerLoad } from './$types';
import { loadVendorCatalog } from '$lib/pricing/catalog.server';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const products = await loadVendorCatalog(params.slug, fetch);
	return { products };
};
