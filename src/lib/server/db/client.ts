import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

// Sin TURSO_DATABASE_URL (ej. en local) cae a un archivo SQLite normal — no
// hace falta cuenta de Turso solo para correr `npm run dev`. En producción
// (Vercel no tiene disco persistente entre despliegues) sí es obligatorio.
const client = createClient({
	url: env.TURSO_DATABASE_URL || 'file:./data/coco.db',
	authToken: env.TURSO_AUTH_TOKEN
});

// libSQL (igual que SQLite) trae las foreign keys apagadas por defecto en
// cada conexión — sin esto, los onDelete: 'cascade' del schema (vendors →
// sessions/vendor_products) no se aplican y quedan filas huérfanas.
await client.execute('PRAGMA foreign_keys = ON');

export const db = drizzle(client, { schema });

// Migraciones automáticas al arrancar: evita el paso manual de "correr
// migrate antes de levantar el server". Es idempotente — sólo aplica lo que
// falte, registrado en __drizzle_migrations.
await migrate(db, { migrationsFolder: './drizzle' });
