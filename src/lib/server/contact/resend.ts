import { sendEmail } from '$lib/server/email/resend';
import type { ContactConfig } from './config';

export interface ContactMessage {
	name: string;
	email: string;
	topic: string;
	message: string;
}

export async function sendContactEmail(
	config: ContactConfig,
	input: ContactMessage,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	await sendEmail(
		config.resendApiKey,
		{
			to: config.toEmail,
			replyTo: input.email,
			subject: `Contacto Coco's: ${input.topic}`,
			text: `De: ${input.name} <${input.email}>\nTema: ${input.topic}\n\n${input.message}`
		},
		fetchFn
	);
}
