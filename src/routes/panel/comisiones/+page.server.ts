import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireVendor } from '$lib/server/auth/guards';
import {
	getVendorProductOverrides,
	upsertVendorProduct,
	deleteVendorProduct
} from '$lib/server/vendors/repository';
import { getCachedProducts } from '$lib/server/products/cache';
import { validateCommissionPercent } from '$lib/vendors/validation';
import { displayPrice } from '$lib/shared/utils/price';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const vendor = requireVendor(locals.vendor);
	const [products, overrides] = await Promise.all([
		getCachedProducts(fetch),
		getVendorProductOverrides(vendor.id)
	]);

	const overrideByProductId = new Map(overrides.map((o) => [o.productId, o]));

	const rows = products.map((p) => {
		const override = overrideByProductId.get(p.id);
		return {
			id: p.id,
			name: p.name,
			sku: p.sku,
			image: p.images[0] ?? '/placeholder.svg',
			category: p.category,
			basePrice: displayPrice(p),
			commissionPercent: override?.commissionPercent ?? null,
			hidden: override?.hidden ?? false
		};
	});

	return { globalCommission: vendor.commissionPercent, rows };
};

interface ChangePayload {
	productId: string;
	commissionPercent: string;
	hidden: boolean;
}

export const actions: Actions = {
	guardar: async ({ request, locals }) => {
		const vendor = requireVendor(locals.vendor);
		const form = await request.formData();
		const raw = String(form.get('cambios') ?? '[]');

		let changes: ChangePayload[];
		try {
			changes = JSON.parse(raw);
		} catch {
			return fail(400, { mensaje: 'No se pudieron leer los cambios' });
		}

		for (const change of changes) {
			const usesGlobal = change.commissionPercent.trim() === '';
			const percent = usesGlobal ? null : validateCommissionPercent(change.commissionPercent);
			if (!usesGlobal && percent === null) {
				return fail(400, { mensaje: `Comisión inválida en un producto (${change.productId})` });
			}

			if (usesGlobal && !change.hidden) {
				await deleteVendorProduct(vendor.id, change.productId);
			} else {
				await upsertVendorProduct(vendor.id, change.productId, {
					commissionPercent: percent,
					hidden: change.hidden
				});
			}
		}

		return { success: true, savedAt: Date.now() };
	}
};
