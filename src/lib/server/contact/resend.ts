import type { ContactConfig } from './config';

export interface ContactMessage {
	name: string;
	email: string;
	topic: string;
	message: string;
}

// Se usa la API REST de Resend directamente (sin su SDK) — es un solo POST,
// igual que el resto de integraciones externas de este proyecto (Woo, Wompi).
// El remitente por defecto de Resend (`onboarding@resend.dev`) funciona sin
// verificar un dominio propio; basta con la API key para empezar a recibir
// los mensajes en `toEmail`.
export async function sendContactEmail(
	config: ContactConfig,
	input: ContactMessage,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${config.resendApiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: "Coco's <onboarding@resend.dev>",
			to: [config.toEmail],
			reply_to: input.email,
			subject: `Contacto Coco's: ${input.topic}`,
			text: `De: ${input.name} <${input.email}>\nTema: ${input.topic}\n\n${input.message}`
		})
	});
	if (!res.ok) {
		const detail = await res.text();
		throw new Error(`Resend ${res.status}: ${detail}`);
	}
}
