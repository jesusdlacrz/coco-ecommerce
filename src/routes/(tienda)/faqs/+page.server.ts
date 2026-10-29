import type { PageServerLoad } from './$types';
import { PUBLIC_PAGE_CACHE } from '$lib/server/http';
import { getSiteExtras } from '$lib/shared/services/siteExtras.server';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	const siteExtras = await getSiteExtras(fetch);
	setHeaders(PUBLIC_PAGE_CACHE);
	return { faqs: siteExtras?.faqs ?? [] };
};
