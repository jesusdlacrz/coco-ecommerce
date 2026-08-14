import type { PageServerLoad } from './$types';
import { loadHouseCatalog } from '$lib/pricing/catalog.server';

export const load: PageServerLoad = async ({ fetch }) => {
	const products = await loadHouseCatalog(fetch);
	return { products };
};
