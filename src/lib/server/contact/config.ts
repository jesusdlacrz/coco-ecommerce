import { env } from '$env/dynamic/private';

export interface ContactConfig {
	resendApiKey: string;
	toEmail: string;
}

// Mismo patrón que getWompiConfig(): null si falta cualquier variable, para
// poder distinguir "no configurado" (setup local sin .env) de un fallo real.
export function getContactConfig(): ContactConfig | null {
	const { RESEND_API_KEY, CONTACT_EMAIL_TO } = env;
	if (!RESEND_API_KEY || !CONTACT_EMAIL_TO) {
		return null;
	}
	return { resendApiKey: RESEND_API_KEY, toEmail: CONTACT_EMAIL_TO };
}
