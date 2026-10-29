// Última copia buena del catálogo (y de cada ficha) guardada en la base
// propia (Turso). Cada lectura exitosa de WordPress la actualiza; si
// WordPress se cae, la tienda sigue mostrando esta copia en vez de un
// catálogo vacío. A diferencia de la caché en memoria, sobrevive a que Vercel
// arranque una instancia nueva.
//
// Es estado operativo, no datos del negocio: la tabla se crea sola y no pasa
// por las migraciones de drizzle (igual que el candado de la sincronización).
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import type { Product } from '$lib/shared/model/products';
import { describeError } from '$lib/shared/utils/describeError';

const CATALOG_KEY = 'catalog';
const productKey = (id: string) => `product:${id}`;

let tableReady: Promise<unknown> | null = null;
function ensureTable() {
	tableReady ??= db.run(sql`
		CREATE TABLE IF NOT EXISTS product_snapshots (
			key TEXT PRIMARY KEY,
			data TEXT NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);
	return tableReady;
}

async function save(key: string, value: unknown): Promise<void> {
	try {
		await ensureTable();
		await db.run(sql`
			INSERT INTO product_snapshots (key, data, updated_at) VALUES (${key}, ${JSON.stringify(value)}, ${Date.now()})
			ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
		`);
	} catch (err) {
		// Guardar la copia es un extra: si falla, la tienda sigue funcionando.
		console.error(`[snapshot] No se pudo guardar "${key}" (${describeError(err)}).`);
	}
}

async function load<T>(key: string): Promise<{ value: T; updatedAt: number } | null> {
	try {
		await ensureTable();
		const res = await db.run(sql`SELECT data, updated_at FROM product_snapshots WHERE key = ${key}`);
		const row = res.rows[0];
		if (!row) return null;
		return { value: JSON.parse(String(row.data)) as T, updatedAt: Number(row.updated_at) };
	} catch (err) {
		console.error(`[snapshot] No se pudo leer "${key}" (${describeError(err)}).`);
		return null;
	}
}

export const saveCatalogSnapshot = (products: Product[]) => save(CATALOG_KEY, products);
export const loadCatalogSnapshot = () => load<Product[]>(CATALOG_KEY);

export const saveProductSnapshot = (id: string, product: Product) => save(productKey(id), product);
export const loadProductSnapshot = (id: string) => load<Product>(productKey(id));

/** Un producto que ya no está publicado no debe "revivir" desde la copia si WordPress cae. */
export async function deleteProductSnapshot(id: string): Promise<void> {
	try {
		await ensureTable();
		await db.run(sql`DELETE FROM product_snapshots WHERE key = ${productKey(id)}`);
	} catch (err) {
		console.error(`[snapshot] No se pudo borrar "${productKey(id)}" (${describeError(err)}).`);
	}
}
