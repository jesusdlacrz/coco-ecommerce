import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { syncEffiToWoo } from '$lib/server/effi/sync';
import { hasBearer } from '$lib/server/effi/auth';
import { describeError } from '$lib/shared/utils/describeError';

export const config = { maxDuration: 60 };

// Recibe los webhooks de Effi (Integraciones → Webhooks): facturas y
// remisiones de venta, ajustes, traslados, devoluciones y cambios de
// artículo. En Effi se configura con la cabecera
// {"Authorization": "Bearer <EFFI_WEBHOOK_SECRET>"}.
//
// No se interpreta el contenido del evento: cualquiera puede mover el stock,
// así que se re-sincroniza stock y precio de lo que ya existe en la tienda
// (sin crear productos nuevos: ver `createNew` en sync.ts). Si llegan varios
// avisos seguidos a la misma instancia, comparten una sola sincronización.
let inflight: Promise<unknown> | null = null;

export const POST: RequestHandler = async ({ request, fetch }) => {
	if (!hasBearer(request, env.EFFI_WEBHOOK_SECRET)) {
		throw error(401, 'No autorizado');
	}
	try {
		inflight ??= syncEffiToWoo({ dryRun: false, createNew: false }, fetch).finally(() => {
			inflight = null;
		});
		await inflight;
		return json({ ok: true });
	} catch (err) {
		// 500: que Effi lo reintente si su webhook reintenta.
		console.error(`[effi-webhook] Falló la sincronización (${describeError(err)}).`);
		throw error(500, 'No se pudo sincronizar');
	}
};
