import type { PageServerLoad } from './$types';
import { PUBLIC_PAGE_CACHE } from '$lib/server/http';
import { loadHouseCatalog } from '$lib/pricing/catalog.server';
import { getSiteContent } from '$lib/shared/services/siteContent.server';
import { getSiteExtras } from '$lib/shared/services/siteExtras.server';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	const [products, siteContent, siteExtras] = await Promise.all([
		loadHouseCatalog(fetch),
		getSiteContent(fetch),
		getSiteExtras(fetch)
	]);
	setHeaders(PUBLIC_PAGE_CACHE);
	return { products, siteContent, siteExtras };
};
