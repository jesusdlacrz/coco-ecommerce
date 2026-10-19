import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { syncEffiToWoo } from '$lib/server/effi/sync';
import { hasBearer } from '$lib/server/effi/auth';
import { describeError } from '$lib/shared/utils/describeError';

// La sincronización completa recorre todo Effi y todo WooCommerce.
export const config = { maxDuration: 60 };

// Sincronización completa Effi → WooCommerce. La llama la tarea diaria de
// Vercel (vercel.json), que envía `Authorization: Bearer <CRON_SECRET>`, y se
// puede llamar a mano con la misma cabecera. `?dry=1` solo simula: devuelve
// lo que haría sin escribir nada.
export const GET: RequestHandler = async ({ request, url, fetch }) => {
	if (!hasBearer(request, env.CRON_SECRET)) {
		throw error(401, 'No autorizado');
	}
	try {
		const report = await syncEffiToWoo({ dryRun: url.searchParams.get('dry') === '1' }, fetch);
		console.log(
			`[effi-sync] creados ${report.created.length}, actualizados ${report.updated.length}, ` +
				`publicados ${report.published.length}, ocultados ${report.hidden.length}, errores ${report.errors.length}` +
				(report.dryRun ? ' (simulación)' : '')
		);
		return json(report);
	} catch (err) {
		console.error(`[effi-sync] Falló la sincronización (${describeError(err)}).`);
		throw error(500, describeError(err));
	}
};
