import { isReservedSlug } from '$lib/server/vendors/repository';

export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface RegisterInput {
	email: string;
	password: string;
	slug: string;
	storeName: string;
}

export function validateRegisterForm(form: FormData): { errors: FieldErrors; data: RegisterInput } {
	const email = String(form.get('email') ?? '')
		.trim()
		.toLowerCase();
	const password = String(form.get('password') ?? '');
	const slug = String(form.get('slug') ?? '')
		.trim()
		.toLowerCase();
	const storeName = String(form.get('storeName') ?? '').trim();

	const errors: FieldErrors = {};

	if (!EMAIL_RE.test(email)) errors.email = 'Correo inválido';
	if (password.length < 8) errors.password = 'Mínimo 8 caracteres';
	if (password.length > 200) errors.password = 'Máximo 200 caracteres';
	if (!SLUG_RE.test(slug) || slug.length < 3 || slug.length > 40) {
		errors.slug = 'Usa entre 3 y 40 minúsculas, números y guiones';
	} else if (isReservedSlug(slug)) {
		errors.slug = 'Esa dirección no está disponible';
	}
	if (storeName.length < 2 || storeName.length > 80) {
		errors.storeName = 'Ponle un nombre a tu tienda (2 a 80 caracteres)';
	}

	return { errors, data: { email, password, slug, storeName } };
}

export interface LoginInput {
	email: string;
	password: string;
}

export function validateLoginForm(form: FormData): { errors: FieldErrors; data: LoginInput } {
	const email = String(form.get('email') ?? '')
		.trim()
		.toLowerCase();
	const password = String(form.get('password') ?? '');

	const errors: FieldErrors = {};
	if (!EMAIL_RE.test(email)) errors.email = 'Correo inválido';
	if (!password) errors.password = 'Ingresa tu contraseña';

	return { errors, data: { email, password } };
}

export interface SettingsInput {
	storeName: string;
	slug: string;
	whatsapp: string;
	bio: string;
	coverImageUrl: string;
	commissionPercent: string;
}

export function validateSettingsForm(form: FormData): { errors: FieldErrors; data: SettingsInput } {
	const storeName = String(form.get('storeName') ?? '').trim();
	const slug = String(form.get('slug') ?? '')
		.trim()
		.toLowerCase();
	const whatsapp = String(form.get('whatsapp') ?? '').trim();
	const bio = String(form.get('bio') ?? '').trim();
	const coverImageUrl = String(form.get('coverImageUrl') ?? '').trim();
	const commissionPercent = String(form.get('commissionPercent') ?? '');

	const errors: FieldErrors = {};
	if (storeName.length < 2 || storeName.length > 80) {
		errors.storeName = 'Ponle un nombre a tu tienda (2 a 80 caracteres)';
	}
	if (!SLUG_RE.test(slug) || slug.length < 3 || slug.length > 40) {
		errors.slug = 'Usa entre 3 y 40 minúsculas, números y guiones';
	} else if (isReservedSlug(slug)) {
		errors.slug = 'Esa dirección no está disponible';
	}
	if (bio.length > 500) errors.bio = 'Máximo 500 caracteres';
	if (coverImageUrl && !/^https?:\/\//.test(coverImageUrl)) {
		errors.coverImageUrl = 'Debe ser una URL válida (http o https)';
	}
	if (commissionPercent.trim() !== '' && validateCommissionPercent(commissionPercent) === null) {
		errors.commissionPercent = 'Ingresa un número entre 0 y 300';
	}

	return { errors, data: { storeName, slug, whatsapp, bio, coverImageUrl, commissionPercent } };
}

export function validateCommissionPercent(raw: string): number | null {
	const trimmed = raw.trim();
	if (trimmed === '') return null;
	const value = Number(trimmed);
	if (!Number.isFinite(value) || value < 0 || value > 300) return null;
	return Math.round(value * 100) / 100;
}

// Evita open-redirect: solo se acepta una ruta interna, nunca una URL absoluta
// ni "//host" (que el navegador interpretaría como protocolo-relative).
export function sanitizeRedirectTarget(raw: string | null): string | null {
	if (!raw) return null;
	if (!raw.startsWith('/') || raw.startsWith('//')) return null;
	return raw;
}
