import type { PageServerLoad } from './$types';
import { loadHouseCatalog } from '$lib/pricing/catalog.server';
import { getSiteContent } from '$lib/shared/services/siteContent.server';
import { getSiteExtras } from '$lib/shared/services/siteExtras.server';

export const load: PageServerLoad = async ({ fetch }) => {
	const [products, siteContent, siteExtras] = await Promise.all([
		loadHouseCatalog(fetch),
		getSiteContent(fetch),
		getSiteExtras(fetch)
	]);
	return { products, siteContent, siteExtras };
};
