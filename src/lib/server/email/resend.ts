import { env } from '$env/dynamic/private';

export function getResendApiKey(): string | null {
	return env.RESEND_API_KEY || null;
}

export interface SendEmailInput {
	to: string;
	subject: string;
	text: string;
	replyTo?: string;
}

// API REST de Resend directa (sin su SDK) — un solo POST, igual que el resto
// de integraciones externas del proyecto (Woo, Wompi). El remitente por
// defecto de Resend (`onboarding@resend.dev`) funciona sin verificar un
// dominio propio. Compartido entre el formulario de contacto y los correos
// de recuperación de contraseña — mismo mecanismo, distinto destinatario.
export async function sendEmail(
	apiKey: string,
	input: SendEmailInput,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: "Coco's <onboarding@resend.dev>",
			to: [input.to],
			...(input.replyTo ? { reply_to: input.replyTo } : {}),
			subject: input.subject,
			text: input.text
		})
	});
	if (!res.ok) {
		const detail = await res.text();
		throw new Error(`Resend ${res.status}: ${detail}`);
	}
}
