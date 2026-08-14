import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { migrate } from 'drizzle-orm/sqlite-proxy/migrator';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

// bun:sqlite (producción) y node:sqlite (desarrollo con Vite) son las
// implementaciones de SQLite embebidas en cada runtime: a diferencia de
// better-sqlite3, ninguna requiere compilar un módulo nativo, así que no hay
// riesgo de binarios N-API incompatibles entre versiones de Node/Bun en el VPS.
interface SyncStatement {
	run(...params: unknown[]): unknown;
	all(...params: unknown[]): Record<string, unknown>[];
	get(...params: unknown[]): Record<string, unknown> | undefined;
}
interface SyncDatabase {
	exec(sql: string): void;
	prepare(sql: string): SyncStatement;
}

async function openDatabase(file: string): Promise<SyncDatabase> {
	if (process.versions.bun) {
		const bunSqlite = 'bun:sqlite';
		const { Database } = await import(/* @vite-ignore */ bunSqlite);
		return new Database(file);
	}
	const nodeSqlite = 'node:sqlite';
	const { DatabaseSync } = await import(/* @vite-ignore */ nodeSqlite);
	return new DatabaseSync(file);
}

// La app nunca invoca `.get()` directamente (siempre `.limit(1)` + `rows[0]`),
// así que el caso "sin filas" de este método no se ejercita — un array vacío
// alcanza para satisfacer el tipo `rows: any[]` que exige sqlite-proxy.
function toRow(row: Record<string, unknown> | undefined): unknown[] {
	return row ? Object.values(row) : [];
}

const DATABASE_URL = env.DATABASE_URL || './data/coco.db';

const sqlite = await openDatabase(DATABASE_URL);
sqlite.exec('PRAGMA journal_mode = WAL');
sqlite.exec('PRAGMA foreign_keys = ON');
sqlite.exec('PRAGMA busy_timeout = 5000');

export const db = drizzle(
	async (sql, params, method) => {
		const stmt = sqlite.prepare(sql);
		if (method === 'run') {
			stmt.run(...params);
			return { rows: [] };
		}
		if (method === 'get') {
			return { rows: toRow(stmt.get(...params)) };
		}
		// 'all' | 'values'
		return { rows: stmt.all(...params).map((row) => Object.values(row)) };
	},
	{ schema }
);

// Migraciones automáticas al arrancar: evita el paso manual de "correr
// migrate antes de levantar el server" en el VPS. Es idempotente — sólo
// aplica lo que falte, registrado en __drizzle_migrations.
await migrate(
	db,
	async (queries) => {
		sqlite.exec('BEGIN');
		try {
			for (const query of queries) sqlite.exec(query);
			sqlite.exec('COMMIT');
		} catch (err) {
			sqlite.exec('ROLLBACK');
			throw err;
		}
	},
	{ migrationsFolder: './drizzle' }
);
