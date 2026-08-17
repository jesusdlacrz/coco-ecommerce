import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE, deleteSessionCookie } from '$lib/server/auth/cookies';
import { invalidateSession } from '$lib/server/auth/session';

export const POST: RequestHandler = async ({ cookies }) => {
	const token = cookies.get(SESSION_COOKIE);
	if (token) await invalidateSession(token);
	deleteSessionCookie(cookies);
	redirect(303, '/');
};
