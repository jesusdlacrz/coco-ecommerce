// Alertas de la sincronización con Effi: que una falla no pase en silencio.
import { env } from '$env/dynamic/private';
import { alert, ALERT_EVERY } from '$lib/server/alerts';
import { describeError } from '$lib/shared/utils/describeError';
import type { SyncReport } from './sync';

const RENEW_STEPS =
	'Renovarla en Effi → Administración → Usuarios del sistema → (usuario principal) Ver más detalles → Renovar API Key, ' +
	'y actualizar EFFI_API_KEY en Vercel (Settings → Environment Variables) y volver a desplegar. ' +
	'Actualizar también EFFI_API_KEY_EXPIRES con la nueva fecha (+360 días).';

/** La sincronización completa falló (no llegó a terminar). */
export async function alertSyncFailure(err: unknown): Promise<void> {
	const message = describeError(err);
	if (/Effi 401/.test(message)) {
		await alert(
			'effi-key-invalid',
			'La API key de Effi venció o no es válida: el inventario NO se está actualizando',
			`Effi rechazó la API key (401). Mientras no se renueve, la tienda no recibe cambios de stock, precios ni productos nuevos de Effi (sigue mostrando lo último que tenía).\n\n${RENEW_STEPS}\n\nError: ${message}`,
			{ every: ALERT_EVERY.DAY }
		);
		return;
	}
	await alert(
		'sync-failed',
		'Falló la sincronización con Effi',
		`La sincronización del inventario de Effi no pudo completarse. Si se repite, la tienda queda con stock/precios desactualizados.\n\nError: ${message}\n\nSe reintenta sola con el próximo cambio en Effi o la sincronización diaria (5:00 a.m.).`,
		{ every: 6 * ALERT_EVERY.HOUR }
	);
}

/** Terminó, pero con productos que no se pudieron procesar. */
export async function alertSyncErrors(report: SyncReport): Promise<void> {
	if (!report.errors.length) return;
	const list = report.errors.slice(0, 15).map((e) => `- ${e}`).join('\n');
	const more = report.errors.length > 15 ? `\n…y ${report.errors.length - 15} más.` : '';
	await alert(
		'sync-errors',
		`Sincronización con Effi con ${report.errors.length} error(es)`,
		`La sincronización terminó, pero algunos productos no se pudieron actualizar:\n\n${list}${more}\n\nSuelen ser fallas pasajeras de WordPress (se corrigen solas en la próxima sincronización). Si se repiten los mismos productos, revisarlos en WooCommerce.`,
		{ every: 12 * ALERT_EVERY.HOUR }
	);
}

/**
 * Avisa antes de que venza la API key de Effi (dura 360 días). Necesita
 * EFFI_API_KEY_EXPIRES=AAAA-MM-DD; sin esa variable no hace nada (igual
 * avisa `alertSyncFailure` cuando Effi la rechace).
 */
export async function checkEffiKeyExpiry(): Promise<void> {
	const raw = env.EFFI_API_KEY_EXPIRES;
	if (!raw) return;
	const expires = new Date(`${raw}T00:00:00-05:00`).getTime();
	if (!Number.isFinite(expires)) return;
	const daysLeft = Math.ceil((expires - Date.now()) / ALERT_EVERY.DAY);
	if (daysLeft > 15) return;
	await alert(
		'effi-key-expiring',
		daysLeft > 0
			? `La API key de Effi vence en ${daysLeft} día(s)`
			: 'La API key de Effi ya venció (según EFFI_API_KEY_EXPIRES)',
		`Cuando venza, la tienda deja de recibir el inventario de Effi.\n\n${RENEW_STEPS}`,
		{ every: daysLeft > 3 ? 3 * ALERT_EVERY.DAY : ALERT_EVERY.DAY }
	);
}
