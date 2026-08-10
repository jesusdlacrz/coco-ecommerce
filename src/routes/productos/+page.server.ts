import type { PageServerLoad } from './$types';
import { getProducts } from '$lib/shared/services/woocommerce.server';

export const load: PageServerLoad = async ({ fetch }) => {
	const products = await getProducts(fetch);
	return { products };
};
