import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { syncEffiToWoo } from '$lib/server/effi/sync';
import { runExclusive } from '$lib/server/effi/lock';
import { hasBearer } from '$lib/server/effi/auth';
import { describeError } from '$lib/shared/utils/describeError';

export const config = { maxDuration: 60 };

// Recibe los webhooks de Effi (Integraciones → Webhooks): artículos, facturas
// y remisiones de venta, ajustes, traslados, devoluciones… En Effi se
// configura con la cabecera {"Authorization": "Bearer <EFFI_WEBHOOK_SECRET>"}.
//
// No se interpreta el contenido del evento: cualquiera puede cambiar stock,
// precio, fotos o crear referencias, así que se corre la sincronización
// completa. El candado garantiza una sola a la vez; si ya hay una corriendo,
// este aviso le pide que repita al terminar y responde de inmediato.
export const POST: RequestHandler = async ({ request, fetch }) => {
	if (!hasBearer(request, env.EFFI_WEBHOOK_SECRET)) {
		throw error(401, 'No autorizado');
	}
	try {
		const report = await runExclusive(() => syncEffiToWoo({ dryRun: false }, fetch));
		return json({ ok: true, queued: report === null });
	} catch (err) {
		// 500: que Effi lo reintente si su webhook reintenta. El detalle va en la
		// respuesta (solo la ve quien tiene el secreto) para poder diagnosticar
		// desde el historial de webhooks de Effi.
		console.error(`[effi-webhook] Falló la sincronización (${describeError(err)}).`);
		throw error(500, `No se pudo sincronizar: ${describeError(err)}`);
	}
};
