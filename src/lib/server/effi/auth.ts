import { timingSafeEqual } from 'node:crypto';

/** ¿La cabecera `Authorization: Bearer <secreto>` coincide? Comparación en tiempo constante. */
export function hasBearer(request: Request, secret: string | undefined): boolean {
	if (!secret) return false;
	const header = request.headers.get('authorization') ?? '';
	const given = Buffer.from(header.replace(/^Bearer\s+/i, ''));
	const expected = Buffer.from(secret);
	return given.length === expected.length && timingSafeEqual(given, expected);
}
