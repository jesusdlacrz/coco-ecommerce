import type { PageServerLoad } from './$types';
import { getProducts } from '$lib/shared/services/woocommerce.server';
import { getSiteContent } from '$lib/shared/services/siteContent.server';

export const load: PageServerLoad = async ({ fetch }) => {
	const [products, siteContent] = await Promise.all([getProducts(fetch), getSiteContent(fetch)]);
	return { products, siteContent };
};
