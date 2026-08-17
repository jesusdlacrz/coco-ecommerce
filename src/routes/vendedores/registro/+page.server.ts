import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateRegisterForm, type FieldErrors } from '$lib/vendors/validation';
import { hashPassword } from '$lib/server/auth/password';
import { createSession } from '$lib/server/auth/session';
import { setSessionCookie } from '$lib/server/auth/cookies';
import { createVendor, parseUniqueViolation } from '$lib/server/vendors/repository';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.vendor) redirect(303, '/panel');
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const { errors, data } = validateRegisterForm(form);
		const values = { email: data.email, slug: data.slug, storeName: data.storeName };

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values });
		}

		const passwordHash = await hashPassword(data.password);

		try {
			const vendor = await createVendor({
				email: data.email,
				passwordHash,
				slug: data.slug,
				storeName: data.storeName
			});

			const { token, expiresAt } = await createSession(vendor.id);
			setSessionCookie(cookies, token, expiresAt);
		} catch (err) {
			const field = parseUniqueViolation(err);
			if (field === 'email') {
				const errors: FieldErrors = { email: 'Ese correo ya está registrado' };
				return fail(409, { errors, values });
			}
			if (field === 'slug') {
				const errors: FieldErrors = { slug: 'Esa dirección de tienda ya está en uso' };
				return fail(409, { errors, values });
			}
			throw err;
		}

		redirect(303, '/panel');
	}
};
