import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateRequestResetForm } from '$lib/vendors/validation';
import { findVendorForLogin } from '$lib/server/vendors/repository';
import { createPasswordResetToken } from '$lib/server/auth/passwordReset';
import { getResendApiKey, sendEmail } from '$lib/server/email/resend';
import { describeError } from '$lib/shared/utils/describeError';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.vendor) redirect(303, '/panel');
	return {};
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const form = await request.formData();
		const { errors, data } = validateRequestResetForm(form);
		const values = { email: data.email };

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values });
		}

		const apiKey = getResendApiKey();
		if (!apiKey) {
			return fail(503, {
				mensaje: 'La recuperación de contraseña no está configurada todavía.',
				values
			});
		}

		// Mismo mensaje exista o no el correo — decirlo distinto revelaría qué
		// correos están registrados (enumeración de usuarios).
		const vendor = await findVendorForLogin(data.email);
		if (vendor) {
			const { token } = await createPasswordResetToken(vendor.id);
			const resetUrl = `${url.origin}/vendedores/restablecer?token=${token}`;
			try {
				await sendEmail(apiKey, {
					to: vendor.email,
					subject: "Restablece tu contraseña - Coco's",
					text: `Hola,\n\nPara elegir una nueva contraseña de tu tienda en Coco's, entra a este link (vence en 1 hora):\n\n${resetUrl}\n\nSi no pediste esto, ignora el correo.`
				});
			} catch (err) {
				console.error(`[password-reset] No se pudo enviar el correo (${describeError(err)}).`);
				return fail(502, {
					mensaje: 'No se pudo enviar el correo. Intenta de nuevo en un momento.',
					values
				});
			}
		}

		return {
			mensaje: 'Si ese correo está registrado, te enviamos un link para restablecer tu contraseña.',
			success: true,
			values: { email: '' }
		};
	}
};
