// Exclusión mutua entre instancias de Vercel, sobre la base (Turso). Para
// secciones cortas que no pueden correr en paralelo: ej. "revisar stock y
// apartarlo" en el checkout — si dos compradores lo hacen a la vez, ambos ven
// las mismas últimas unidades disponibles.
//
// Tabla operativa, creada sola (no pasa por las migraciones de drizzle).
import { sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from './client';

let tableReady: Promise<unknown> | null = null;
function ensureTable() {
	tableReady ??= db.run(sql`
		CREATE TABLE IF NOT EXISTS app_mutex (
			id TEXT PRIMARY KEY,
			owner TEXT NOT NULL,
			locked_until INTEGER NOT NULL
		)
	`);
	return tableReady;
}

export class MutexBusyError extends Error {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Ejecuta `fn` con el candado `name`. Si está ocupado, espera hasta `waitMs`
 * y luego lanza MutexBusyError. `ttlMs` es el seguro: si la instancia que lo
 * tenía se cae, el candado se libera solo pasado ese tiempo.
 */
export async function withMutex<T>(
	name: string,
	fn: () => Promise<T>,
	{ ttlMs = 20_000, waitMs = 10_000 }: { ttlMs?: number; waitMs?: number } = {}
): Promise<T> {
	await ensureTable();
	const owner = randomUUID();
	const giveUpAt = Date.now() + waitMs;

	for (;;) {
		const now = Date.now();
		const res = await db.run(sql`
			INSERT INTO app_mutex (id, owner, locked_until) VALUES (${name}, ${owner}, ${now + ttlMs})
			ON CONFLICT(id) DO UPDATE SET owner = excluded.owner, locked_until = excluded.locked_until
			WHERE app_mutex.locked_until < ${now}
		`);
		if (res.rowsAffected === 1) break;
		if (Date.now() > giveUpAt) throw new MutexBusyError(`"${name}" ocupado`);
		await sleep(150 + Math.random() * 150);
	}

	try {
		return await fn();
	} finally {
		// Solo lo suelta quien lo tiene (si venció y lo tomó otro, no se lo quita).
		await db.run(sql`UPDATE app_mutex SET locked_until = 0 WHERE id = ${name} AND owner = ${owner}`);
	}
}
