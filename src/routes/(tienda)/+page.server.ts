import type { PageServerLoad } from './$types';
import { loadHouseCatalog } from '$lib/pricing/catalog.server';
import { getSiteContent } from '$lib/shared/services/siteContent.server';

export const load: PageServerLoad = async ({ fetch }) => {
	const [products, siteContent] = await Promise.all([
		loadHouseCatalog(fetch),
		getSiteContent(fetch)
	]);
	return { products, siteContent };
};
