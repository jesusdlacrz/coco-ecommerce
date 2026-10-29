import type { PageServerLoad } from './$types';
import { PUBLIC_PAGE_CACHE } from '$lib/server/http';
import { loadHouseCatalog } from '$lib/pricing/catalog.server';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	const products = await loadHouseCatalog(fetch);
	setHeaders(PUBLIC_PAGE_CACHE);
	return { products };
};
