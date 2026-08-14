import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateLoginForm, sanitizeRedirectTarget } from '$lib/vendors/validation';
import { verifyPassword, DUMMY_HASH } from '$lib/server/auth/password';
import { createSession } from '$lib/server/auth/session';
import { setSessionCookie } from '$lib/server/auth/cookies';
import { findVendorForLogin } from '$lib/server/vendors/repository';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.vendor) redirect(303, '/panel');
	return {};
};

// Límite de intentos en memoria — por proceso, suficiente con un solo
// contenedor. 5 intentos cada 15 minutos por combinación correo+IP.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function tooManyAttempts(key: string): boolean {
	const entry = attempts.get(key);
	if (!entry || Date.now() > entry.resetAt) return false;
	return entry.count >= MAX_ATTEMPTS;
}

function registerAttempt(key: string): void {
	const entry = attempts.get(key);
	if (!entry || Date.now() > entry.resetAt) {
		attempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
		return;
	}
	entry.count += 1;
}

export const actions: Actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const form = await request.formData();
		const { errors, data } = validateLoginForm(form);
		const values = { email: data.email };

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values });
		}

		const rateLimitKey = `${data.email}|${getClientAddress()}`;
		if (tooManyAttempts(rateLimitKey)) {
			return fail(429, {
				mensaje: 'Demasiados intentos. Intenta de nuevo en unos minutos.',
				values
			});
		}

		const vendor = await findVendorForLogin(data.email);
		// Siempre corremos verifyPassword (con un hash de descarte si el correo no
		// existe) para que la latencia no delate qué correos están registrados.
		const valid = await verifyPassword(vendor?.passwordHash ?? DUMMY_HASH, data.password);

		if (!vendor || !valid) {
			registerAttempt(rateLimitKey);
			return fail(400, { mensaje: 'Correo o contraseña incorrectos', values });
		}

		const { token, expiresAt } = await createSession(vendor.id);
		setSessionCookie(cookies, token, expiresAt);

		const redirectTo = sanitizeRedirectTarget(url.searchParams.get('redirigir'));
		redirect(303, redirectTo ?? '/panel');
	}
};
