import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import {
	fetchProductsOrThrow,
	getProduct,
	WooNotConfiguredError
} from '$lib/shared/services/woocommerce.server';
import { sampleProducts } from '$lib/dataProducts/products';
import type { Product } from '$lib/shared/model/products';

// Con N vendedores, cada uno renderizando el catálogo completo, cada request
// sin caché dispararía un fetch nuevo a WordPress. TTL corto en éxito, más
// corto todavía tras un error para reintentar pronto sin martillear.
const TTL_OK_MS = Number(env.PRODUCTS_CACHE_TTL_MS) || 5 * 60_000;
const TTL_ERROR_MS = 30_000;

let cache: { products: Product[]; expiresAt: number } | null = null;
let lastGood: Product[] | null = null; // último catálogo real — stale-while-error
let inflight: Promise<Product[]> | null = null;

export async function getCachedProducts(fetchFn: typeof fetch = fetch): Promise<Product[]> {
	if (cache && Date.now() < cache.expiresAt) return cache.products;

	// Single-flight: si 20 vendedores piden a la vez, WordPress recibe UNA petición.
	if (inflight) return inflight;

	inflight = (async () => {
		try {
			const products = await fetchProductsOrThrow(fetchFn);
			lastGood = products;
			cache = { products, expiresAt: Date.now() + TTL_OK_MS };
			return products;
		} catch (err) {
			const isUnconfigured = err instanceof WooNotConfiguredError;
			// Preferimos datos reales viejos antes que los de ejemplo. En producción
			// nunca se sirven ejemplos: el checkout valida precios contra esta misma
			// lista, así que se podría cobrar una prenda que no existe en WooCommerce.
			const products = lastGood ?? (dev ? sampleProducts : []);
			cache = { products, expiresAt: Date.now() + (isUnconfigured ? TTL_OK_MS : TTL_ERROR_MS) };
			if (!isUnconfigured) {
				console.error(
					`[products-cache] Sirviendo ${lastGood ? 'caché vieja' : 'ejemplos'} tras un error: ${err instanceof Error ? err.message : String(err)}`
				);
			}
			return products;
		} finally {
			inflight = null;
		}
	})();

	return inflight;
}

// Fichas completas (con variaciones), una entrada por producto. El listado
// ya no trae variaciones, así que la ficha y el checkout piden solo la del
// producto que necesitan: una consulta (~1,5 s en frío) en vez del catálogo
// entero con las de todos.
const details = new Map<string, { product: Product | null; expiresAt: number }>();
const detailsInflight = new Map<string, Promise<Product | null>>();

/** Producto completo, con stock por talla/color. `null` si no existe o no está publicado. */
export async function getCachedProduct(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<Product | null> {
	const hit = details.get(id);
	if (hit && Date.now() < hit.expiresAt) return hit.product;

	// Single-flight por producto: varias visitas a la vez = una consulta.
	const pending = detailsInflight.get(id);
	if (pending) return pending;

	const request = (async () => {
		try {
			const product = await getProduct(id, fetchFn);
			// `getProduct` devuelve null tanto si no existe como si WordPress
			// falló: un null se cachea poco, para reintentar pronto.
			details.set(id, { product, expiresAt: Date.now() + (product ? TTL_OK_MS : TTL_ERROR_MS) });
			return product ?? hit?.product ?? null; // ante una falla, la versión anterior
		} finally {
			detailsInflight.delete(id);
		}
	})();
	detailsInflight.set(id, request);
	return request;
}

export function invalidateProductsCache(): void {
	cache = null;
	details.clear();
}
