// Candado para que solo corra UNA sincronización con Effi a la vez, aunque
// Vercel tenga varias instancias vivas. Sin esto, dos avisos de Effi casi
// simultáneos crearían el mismo producto dos veces en WooCommerce.
//
// Vive en la misma base (Turso / SQLite local) que los checkouts. La tabla se
// crea sola la primera vez: es estado operativo, no datos del negocio, así que
// no pasa por las migraciones de drizzle.
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db/client';

const LOCK_ID = 'effi-sync';
// Si una sincronización se cae a la mitad, el candado vence solo. Holgado
// frente al máximo de 60 s de una función de Vercel.
const LOCK_TTL_MS = 90_000;
// Repeticiones máximas por avisos que llegaron mientras corría: acota el
// tiempo total dentro del límite de la función.
const MAX_RERUNS = 2;

let tableReady: Promise<unknown> | null = null;
function ensureTable() {
	tableReady ??= db.run(sql`
		CREATE TABLE IF NOT EXISTS effi_sync_lock (
			id TEXT PRIMARY KEY,
			locked_until INTEGER NOT NULL,
			rerun INTEGER NOT NULL DEFAULT 0
		)
	`);
	return tableReady;
}

async function tryAcquire(): Promise<boolean> {
	await ensureTable();
	const now = Date.now();
	const res = await db.run(sql`
		INSERT INTO effi_sync_lock (id, locked_until, rerun) VALUES (${LOCK_ID}, ${now + LOCK_TTL_MS}, 0)
		ON CONFLICT(id) DO UPDATE SET locked_until = excluded.locked_until, rerun = 0
		WHERE effi_sync_lock.locked_until < ${now}
	`);
	return res.rowsAffected === 1;
}

/** Anota que llegó un cambio mientras otra sincronización corría. */
async function requestRerun(): Promise<void> {
	await db.run(sql`UPDATE effi_sync_lock SET rerun = 1 WHERE id = ${LOCK_ID}`);
}

/**
 * Suelta el candado SOLO si nadie pidió repetir, en la misma operación: así
 * un aviso que llegue justo al terminar no puede quedar sin procesar.
 */
async function releaseIfIdle(): Promise<boolean> {
	const res = await db.run(sql`
		UPDATE effi_sync_lock SET locked_until = 0 WHERE id = ${LOCK_ID} AND rerun = 0
	`);
	return res.rowsAffected === 1;
}

/** Toma el pedido de repetición y renueva el candado para la siguiente vuelta. */
async function startRerun(): Promise<void> {
	await db.run(sql`
		UPDATE effi_sync_lock SET rerun = 0, locked_until = ${Date.now() + LOCK_TTL_MS}
		WHERE id = ${LOCK_ID}
	`);
}

async function forceRelease(): Promise<void> {
	await db.run(sql`UPDATE effi_sync_lock SET locked_until = 0, rerun = 0 WHERE id = ${LOCK_ID}`);
}

/**
 * Ejecuta `task` con el candado. Si otra sincronización ya está corriendo,
 * no espera: le deja anotado que repita al terminar (así el cambio que trajo
 * este aviso no se pierde) y devuelve `null`.
 */
export async function runExclusive<T>(task: () => Promise<T>): Promise<T | null> {
	if (!(await tryAcquire())) {
		await requestRerun();
		// Puede que la otra haya terminado justo ahora: entonces se corre aquí.
		if (!(await tryAcquire())) return null;
	}
	try {
		let result = await task();
		for (let reruns = 0; !(await releaseIfIdle()); reruns++) {
			if (reruns >= MAX_RERUNS) {
				// Lo que quede lo recoge el próximo aviso o la sincronización diaria.
				await forceRelease();
				break;
			}
			await startRerun();
			result = await task();
		}
		return result;
	} catch (err) {
		await forceRelease();
		throw err;
	}
}
