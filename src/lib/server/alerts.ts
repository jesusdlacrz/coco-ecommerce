// Alertas por correo para lo que no puede fallar en silencio: un pago aprobado
// que no logró crear su pedido, la sincronización con Effi caída, la API key
// de Effi vencida o por vencer, WordPress caído.
//
// Van a ALERT_EMAIL_TO (quien mantiene la tienda), NUNCA al buzón de la
// tienda: son avisos técnicos. Con el remitente por defecto de Resend
// (onboarding@resend.dev) solo se puede enviar al correo dueño de la cuenta
// de Resend; para otro destinatario hay que verificar un dominio en Resend.
//
// Cada alerta tiene una clave y un intervalo mínimo entre envíos, guardado en
// la base: una falla que se repite cada minuto no llena el buzón.
import { env } from '$env/dynamic/private';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { getResendApiKey, sendEmail } from '$lib/server/email/resend';
import { describeError } from '$lib/shared/utils/describeError';

const HOUR = 60 * 60_000;

let tableReady: Promise<unknown> | null = null;
function ensureTable() {
	tableReady ??= db.run(sql`
		CREATE TABLE IF NOT EXISTS app_alerts (
			key TEXT PRIMARY KEY,
			last_sent INTEGER NOT NULL
		)
	`);
	return tableReady;
}

/** Reclama el envío de esta alerta si pasó el intervalo (atómico entre instancias). */
async function claimSend(key: string, everyMs: number): Promise<boolean> {
	await ensureTable();
	const now = Date.now();
	const res = await db.run(sql`
		INSERT INTO app_alerts (key, last_sent) VALUES (${key}, ${now})
		ON CONFLICT(key) DO UPDATE SET last_sent = excluded.last_sent
		WHERE app_alerts.last_sent < ${now - everyMs}
	`);
	return res.rowsAffected === 1;
}

/**
 * Envía una alerta. Nunca lanza: una alerta que falla no puede tumbar lo que
 * la disparó (ej. el webhook de un pago). Sin ALERT_EMAIL_TO o sin Resend,
 * queda solo en el log.
 */
export async function alert(
	key: string,
	subject: string,
	body: string,
	{ every = 6 * HOUR }: { every?: number } = {}
): Promise<void> {
	console.error(`[alerta] ${subject}\n${body}`);
	const to = env.ALERT_EMAIL_TO;
	const apiKey = getResendApiKey();
	if (!to || !apiKey) return;
	try {
		if (!(await claimSend(key, every))) return;
		await sendEmail(apiKey, {
			to,
			subject: `[Tienda Coco's] ${subject}`,
			text: `${body}\n\n—\nAviso automático de la tienda. Detalles técnicos: EFFI-SETUP.md.`
		});
	} catch (err) {
		console.error(`[alerta] No se pudo enviar "${key}" (${describeError(err)}).`);
	}
}

export const ALERT_EVERY = { HOUR, DAY: 24 * HOUR };
