import type { PageServerLoad } from './$types';
import { PUBLIC_PAGE_CACHE } from '$lib/server/http';
import { loadVendorCatalog } from '$lib/pricing/catalog.server';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	const products = await loadVendorCatalog(params.slug, fetch);
	setHeaders(PUBLIC_PAGE_CACHE);
	return { products };
};
