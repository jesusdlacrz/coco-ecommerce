import {
	randomBytes,
	scrypt as scryptCallback,
	timingSafeEqual,
	type ScryptOptions
} from 'node:crypto';
import { promisify } from 'node:util';

// El overload de @types/node para promisify(scrypt) no expone la variante
// con `options` — la recuperamos con un cast explícito.
const scrypt = promisify(scryptCallback) as (
	password: string,
	salt: Buffer,
	keylen: number,
	options: ScryptOptions
) => Promise<Buffer>;

// 128 * N * r bytes de memoria = 16 MB, por debajo del límite por defecto de Node.
const PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16);
	const key = (await scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, PARAMS)) as Buffer;
	return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(stored: string, password: string): Promise<boolean> {
	const parts = stored.split('$');
	if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
	const [, n, r, p, saltB64, keyB64] = parts;
	const expected = Buffer.from(keyB64, 'base64');
	const key = (await scrypt(
		password.normalize('NFKC'),
		Buffer.from(saltB64, 'base64'),
		expected.length,
		{
			N: Number(n),
			r: Number(r),
			p: Number(p)
		}
	)) as Buffer;
	return key.length === expected.length && timingSafeEqual(key, expected);
}

// Hash de descarte: gasta el mismo tiempo que una verificación real cuando el
// correo no existe, para no revelar por timing qué cuentas están registradas.
export const DUMMY_HASH = `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$AAAAAAAAAAAAAAAAAAAAAA==$${'A'.repeat(88)}`;
