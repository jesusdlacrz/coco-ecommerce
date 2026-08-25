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

// Migraciones automáticas SOLO contra el archivo SQLite local (sin Turso) —
// es información de desarrollo, cómoda porque evita el paso manual de correr
// migrate antes de levantar el server. Contra Turso (producción en Vercel)
// esto se desactiva a propósito: el bundle serverless de Vercel no empaqueta
// la carpeta `drizzle/` (solo lo que el grafo de imports de JS alcanza), así
// que `migrate()` tronaba buscando esos archivos .sql en cada request — y
// como este módulo se carga en cada petición (vía hooks.server.ts), tumbaba
// el sitio completo. Las migraciones contra Turso se corren manualmente desde
// local (`npm run db:generate` + levantar el server local apuntando a Turso)
// antes de desplegar.
if (!env.TURSO_DATABASE_URL) {
	await migrate(db, { migrationsFolder: './drizzle' });
}
