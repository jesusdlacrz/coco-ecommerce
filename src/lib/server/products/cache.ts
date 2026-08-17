import { env } from '$env/dynamic/private';
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
			// Preferimos datos reales viejos antes que los de ejemplo.
			const products = lastGood ?? sampleProducts;
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

export async function getCachedProduct(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<Product | null> {
	const products = await getCachedProducts(fetchFn);
	const hit = products.find((p) => p.id === id);
	if (hit) return hit;
	// per_page=100: si la tienda crece, un producto puede quedar fuera del
	// listado cacheado — lo buscamos directo como último recurso.
	return getProduct(id, fetchFn);
}

export function invalidateProductsCache(): void {
	cache = null;
}
