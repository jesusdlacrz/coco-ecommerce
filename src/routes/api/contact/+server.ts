import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getContactConfig } from '$lib/server/contact/config';
import { sendContactEmail, type ContactMessage } from '$lib/server/contact/resend';
import { describeError } from '$lib/shared/utils/describeError';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

function isValidMessage(body: Partial<ContactMessage>): body is ContactMessage {
	return Boolean(
		body.name?.trim() &&
			body.name.length <= MAX_FIELD_LENGTH &&
			body.email?.trim() &&
			body.email.length <= MAX_FIELD_LENGTH &&
			EMAIL_PATTERN.test(body.email) &&
			body.topic?.trim() &&
			body.topic.length <= MAX_FIELD_LENGTH &&
			body.message?.trim() &&
			body.message.length <= MAX_MESSAGE_LENGTH
	);
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	const contact = getContactConfig();
	if (!contact) {
		throw error(503, 'El formulario de contacto no está configurado todavía.');
	}

	const body = (await request.json()) as Partial<ContactMessage>;
	if (!isValidMessage(body)) {
		throw error(400, 'Completa todos los campos con un correo válido.');
	}

	try {
		await sendContactEmail(
			contact,
			{
				name: body.name.trim(),
				email: body.email.trim(),
				topic: body.topic.trim(),
				message: body.message.trim()
			},
			fetch
		);
	} catch (err) {
		console.error(`[contact] No se pudo enviar el mensaje (${describeError(err)}).`);
		throw error(502, 'No se pudo enviar tu mensaje. Intenta de nuevo en un momento.');
	}

	return json({ ok: true });
};
