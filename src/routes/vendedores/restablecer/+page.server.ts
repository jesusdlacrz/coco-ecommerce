import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateResetPasswordForm } from '$lib/vendors/validation';
import { hashPassword } from '$lib/server/auth/password';
import {
	getVendorIdForResetToken,
	deletePasswordResetToken
} from '$lib/server/auth/passwordReset';
import { updateVendorPassword } from '$lib/server/vendors/repository';
import { invalidateVendorSessions, createSession } from '$lib/server/auth/session';
import { setSessionCookie } from '$lib/server/auth/cookies';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (locals.vendor) redirect(303, '/panel');

	const token = url.searchParams.get('token') ?? '';
	const vendorId = token ? await getVendorIdForResetToken(token) : null;
	return { validToken: vendorId !== null };
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const token = url.searchParams.get('token') ?? '';
		const form = await request.formData();
		const { errors, data } = validateResetPasswordForm(form);

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		// Se revalida aquí (no solo en `load`): el link pudo vencer entre que se
		// abrió la página y que se envió el formulario.
		const vendorId = token ? await getVendorIdForResetToken(token) : null;
		if (!vendorId) {
			return fail(400, { mensaje: 'Este link ya no es válido. Pide uno nuevo.' });
		}

		const passwordHash = await hashPassword(data.password);
		await updateVendorPassword(vendorId, passwordHash);
		await deletePasswordResetToken(token);
		// Cierra cualquier sesión abierta con la contraseña vieja — si alguien
		// más tenía acceso, este es el momento de sacarlo.
		await invalidateVendorSessions(vendorId);

		const { token: sessionToken, expiresAt } = await createSession(vendorId);
		setSessionCookie(cookies, sessionToken, expiresAt);

		redirect(303, '/panel');
	}
};
