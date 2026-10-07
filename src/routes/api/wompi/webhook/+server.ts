import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWompiConfig } from '$lib/server/wompi/config';
import { verifyEventChecksum } from '$lib/server/wompi/signature';
import { applyWompiTransaction, type WompiTransaction } from '$lib/server/checkout/fulfill';

interface WompiWebhookPayload {
	event: string;
	data: { transaction: WompiTransaction };
	signature: { properties: string[]; checksum: string };
	timestamp: number;
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	const wompi = getWompiConfig();
	if (!wompi) {
		// 500 (no 200): si Wompi no está configurado en este ambiente, queremos
		// que Wompi reintente en vez de dar por entregado un evento que nunca
		// se procesó — un 200 aquí perdería confirmaciones de pago reales para
		// siempre en cuanto se corrija la configuración.
		console.error('[wompi-webhook] Evento recibido pero Wompi no está configurado.');
		throw error(500, 'Wompi no está configurado');
	}

	const payload = (await request.json()) as WompiWebhookPayload;

	if (!verifyEventChecksum(payload, wompi.eventsSecret)) {
		throw error(400, 'Firma inválida');
	}

	// Solo nos interesan las actualizaciones de transacción; cualquier otro
	// evento se reconoce sin procesar.
	if (payload.event !== 'transaction.updated') {
		return json({ ok: true });
	}

	try {
		await applyWompiTransaction(payload.data.transaction, fetch);
	} catch {
		// Ya quedó en el log; el 500 hace que Wompi reintente el evento.
		throw error(500, 'No se pudo crear el pedido');
	}

	return json({ ok: true });
};
