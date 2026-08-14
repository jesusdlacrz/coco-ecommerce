import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getApprovedVendorBySlug } from '$lib/server/vendors/repository';
import type { Storefront } from '$lib/storefront/model';

export const load: LayoutServerLoad = async ({ params }) => {
	const vendor = await getApprovedVendorBySlug(params.slug);
	// 404, no 403: no confirmamos ni negamos si el slug existe pero está
	// suspendido — para el visitante, una tienda no aprobada simplemente no existe.
	if (!vendor) error(404, 'Tienda no encontrada');

	const storefront: Storefront = {
		kind: 'vendor',
		slug: vendor.slug,
		basePath: `/v/${vendor.slug}`,
		name: vendor.storeName,
		whatsapp: vendor.whatsapp,
		bio: vendor.bio,
		coverImageUrl: vendor.coverImageUrl,
		cartKey: `cart:v:${vendor.slug}`
	};

	return { storefront };
};
