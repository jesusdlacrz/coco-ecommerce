import type { PageServerLoad } from './$types';
import { requireVendor } from '$lib/server/auth/guards';
import { getVendorProductOverrides } from '$lib/server/vendors/repository';
import { getCachedProducts } from '$lib/server/products/cache';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const vendor = requireVendor(locals.vendor);
	const [products, overrides] = await Promise.all([
		getCachedProducts(fetch),
		getVendorProductOverrides(vendor.id)
	]);

	const validProductIds = new Set(products.map((p) => p.id));
	const activeOverrides = overrides.filter((o) => validProductIds.has(o.productId));

	return {
		totalProducts: products.length,
		customCommissionCount: activeOverrides.filter((o) => o.commissionPercent !== null).length,
		hiddenCount: activeOverrides.filter((o) => o.hidden).length
	};
};
