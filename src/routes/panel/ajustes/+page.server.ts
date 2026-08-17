import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { requireVendor } from '$lib/server/auth/guards';
import {
	validateSettingsForm,
	validateCommissionPercent,
	type FieldErrors
} from '$lib/vendors/validation';
import { updateVendorSettings, parseUniqueViolation } from '$lib/server/vendors/repository';

export const actions: Actions = {
	guardar: async ({ request, locals }) => {
		const vendor = requireVendor(locals.vendor);
		const form = await request.formData();
		const { errors, data } = validateSettingsForm(form);

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: data });
		}

		const commissionPercent =
			data.commissionPercent.trim() === ''
				? vendor.commissionPercent
				: validateCommissionPercent(data.commissionPercent);

		try {
			await updateVendorSettings(vendor.id, {
				storeName: data.storeName,
				slug: data.slug,
				whatsapp: data.whatsapp || null,
				bio: data.bio || null,
				coverImageUrl: data.coverImageUrl || null,
				commissionPercent: commissionPercent ?? vendor.commissionPercent
			});
		} catch (err) {
			const field = parseUniqueViolation(err);
			if (field === 'slug') {
				const errors: FieldErrors = { slug: 'Esa dirección de tienda ya está en uso' };
				return fail(409, { errors, values: data });
			}
			throw err;
		}

		return { success: true, values: data };
	}
};
