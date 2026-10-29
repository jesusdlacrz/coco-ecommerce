import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import {
	fetchProductsOrThrow,
	fetchProductOrThrow,
	WooNotConfiguredError
} from '$lib/shared/services/woocommerce.server';
import { sampleProducts } from '$lib/dataProducts/products';
import type { Product } from '$lib/shared/model/products';
import { describeError } from '$lib/shared/utils/describeError';
import { alert, ALERT_EVERY } from '$lib/server/alerts';
import {
	saveCatalogSnapshot,
	loadCatalogSnapshot,
	saveProductSnapshot,
	loadProductSnapshot,
	deleteProductSnapshot
} from './snapshot';

// Tres niveles, del más rápido al más resistente:
// 1. Memoria de esta instancia (5 min).
// 2. WordPress (la fuente real; lento en el hosting compartido).
// 3. Última copia buena guardada en la base (si WordPress falla): la tienda
//    sigue mostrando productos aunque WordPress esté caído, sin importar
//    cuánto dure ni si Vercel arrancó una instancia nueva.
const TTL_OK_MS = Number(env.PRODUCTS_CACHE_TTL_MS) || 5 * 60_000;
const TTL_ERROR_MS = 30_000;

let cache: { products: Product[]; expiresAt: number } | null = null;
let inflight: Promise<Product[]> | null = null;

function alertWordPressDown(err: unknown) {
	void alert(
		'wordpress-down',
		'WordPress no responde: la tienda muestra la última copia guardada',
		`La tienda no pudo leer los productos de WordPress (Hostinger) y está mostrando la última copia guardada del catálogo.\n\nLos clientes siguen viendo los productos, pero los cambios recientes (stock, precios, fotos) no se ven hasta que WordPress vuelva. Los pedidos pagados se crean cuando vuelva (Wompi reintenta).\n\nError: ${describeError(err)}\n\nRevisar el estado del hosting en hpanel.hostinger.com.`,
		{ every: 3 * ALERT_EVERY.HOUR }
	);
}

export async function getCachedProducts(fetchFn: typeof fetch = fetch): Promise<Product[]> {
	if (cache && Date.now() < cache.expiresAt) return cache.products;

	// Single-flight: si 20 vendedores piden a la vez, WordPress recibe UNA petición.
	if (inflight) return inflight;

	inflight = (async () => {
		try {
			const products = await fetchProductsOrThrow(fetchFn);
			cache = { products, expiresAt: Date.now() + TTL_OK_MS };
			await saveCatalogSnapshot(products);
			return products;
		} catch (err) {
			if (err instanceof WooNotConfiguredError) {
				// Setup local sin .env: ejemplos solo en desarrollo.
				const products = dev ? sampleProducts : [];
				cache = { products, expiresAt: Date.now() + TTL_OK_MS };
				return products;
			}
			// Nunca ejemplos en producción: el checkout valida precios contra esta
			// lista, así que se podría cobrar una prenda que no existe.
			const snapshot = cache?.products ?? (await loadCatalogSnapshot())?.value ?? null;
			const products = snapshot ?? (dev ? sampleProducts : []);
			cache = { products, expiresAt: Date.now() + TTL_ERROR_MS };
			console.error(
				`[products-cache] WordPress falló; sirviendo ${snapshot ? 'la última copia guardada' : 'un catálogo vacío'} (${describeError(err)}).`
			);
			alertWordPressDown(err);
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

async function fetchDetail(id: string, fetchFn: typeof fetch): Promise<Product | null> {
	const previous = details.get(id)?.product ?? null;
	try {
		const product = await fetchProductOrThrow(id, fetchFn);
		details.set(id, { product, expiresAt: Date.now() + TTL_OK_MS });
		if (product) await saveProductSnapshot(id, product);
		else await deleteProductSnapshot(id); // ya no está publicado: que no "reviva"
		return product;
	} catch (err) {
		if (err instanceof WooNotConfiguredError) {
			return dev ? (sampleProducts.find((p) => p.id === id) ?? null) : null;
		}
		const fallback = previous ?? (await loadProductSnapshot(id))?.value ?? null;
		details.set(id, { product: fallback, expiresAt: Date.now() + TTL_ERROR_MS });
		console.error(
			`[products-cache] WordPress falló con "${id}"; ${fallback ? 'sirviendo la última copia guardada' : 'sin copia guardada'} (${describeError(err)}).`
		);
		alertWordPressDown(err);
		return fallback;
	}
}

function singleFlight(id: string, fetchFn: typeof fetch): Promise<Product | null> {
	const pending = detailsInflight.get(id);
	if (pending) return pending;
	const request = fetchDetail(id, fetchFn).finally(() => detailsInflight.delete(id));
	detailsInflight.set(id, request);
	return request;
}

/** Producto completo, con stock por talla/color. `null` si no existe o no está publicado. */
export async function getCachedProduct(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<Product | null> {
	const hit = details.get(id);
	if (hit && Date.now() < hit.expiresAt) return hit.product;
	return singleFlight(id, fetchFn);
}

/**
 * Igual que getCachedProduct pero sin caché: consulta WordPress ahora mismo.
 * La usa el checkout para validar stock con el número real (no el de hace
 * hasta 5 minutos) justo antes de cobrar.
 */
export async function getFreshProduct(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<Product | null> {
	return singleFlight(id, fetchFn);
}

export function invalidateProductsCache(): void {
	cache = null;
	details.clear();
}
