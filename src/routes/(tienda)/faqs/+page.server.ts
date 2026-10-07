import type { PageServerLoad } from './$types';
import { getSiteExtras } from '$lib/shared/services/siteExtras.server';

export const load: PageServerLoad = async ({ fetch }) => {
	const siteExtras = await getSiteExtras(fetch);
	return { faqs: siteExtras?.faqs ?? [] };
};
