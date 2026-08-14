import { setDefaultResultOrder } from 'node:dns';
import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE, deleteSessionCookie, setSessionCookie } from '$lib/server/auth/cookies';
import { validateSessionToken } from '$lib/server/auth/session';

// El dominio de WordPress (Hostinger) resuelve primero a direcciones IPv6, pero
// muchas redes no tienen ruta IPv6 hacia el hosting: Node intenta IPv6 y falla
// con "fetch failed". Los navegadores lo evitan probando IPv4 e IPv6 en paralelo
// (Happy Eyeballs); Node no lo hace por defecto. Forzar IPv4 primero hace que
// las peticiones a WooCommerce usen la ruta que sí funciona.
setDefaultResultOrder('ipv4first');

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.vendor = null;

	const token = event.cookies.get(SESSION_COOKIE);
	if (!token) return resolve(event);

	const result = await validateSessionToken(token);
	if (!result) {
		deleteSessionCookie(event.cookies);
		return resolve(event);
	}

	// Sesión deslizante: si se extendió en la BD, reescribimos la cookie.
	if (result.renewed) setSessionCookie(event.cookies, token, result.expiresAt);

	event.locals.vendor = result.vendor;
	return resolve(event);
};
