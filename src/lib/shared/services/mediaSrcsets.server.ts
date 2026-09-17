import { env } from '$env/dynamic/private';

/**
 * Traduce la URL de una imagen subida a WordPress al `srcset` de los tamaños
 * que WordPress ya generó para ella.
 *
 * Las imágenes de producto llegan con `srcset` desde la API de WooCommerce,
 * pero las que la clienta sube a mano (el hero, Instagram) vienen del endpoint
 * propio del tema, que solo devuelve la URL suelta. Sin `srcset`, el móvil se
 * descargaba el original —1295 px para pintar una columna de 164— y esa foto
 * era además el elemento más grande de la página.
 *
 * La biblioteca de medios de WordPress es de lectura pública, así que basta
 * una petición para construir el mapa. Si falla, se devuelve vacío: cada
 * imagen sigue funcionando con su URL original.
 */

const TTL_MS = 10 * 60_000;
const TIMEOUT_MS = 15_000;

interface WpMediaSize {
	source_url: string;
	width: number;
}

interface WpMedia {
	source_url: string;
	media_details?: { sizes?: Record<string, WpMediaSize> };
}

let cache: { map: Record<string, string>; expiresAt: number } | null = null;
let inflight: Promise<Record<string, string>> | null = null;

function toSrcset(item: WpMedia): string | null {
	const sizes = Object.values(item.media_details?.sizes ?? {});
	if (sizes.length < 2) return null;
	// Un mismo ancho puede aparecer con dos nombres (`medium` y `woocommerce_single`).
	const porAncho = new Map<number, string>();
	for (const s of sizes) porAncho.set(s.width, s.source_url);
	return [...porAncho.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([w, url]) => `${url} ${w}w`)
		.join(', ');
}

export async function getMediaSrcsets(
	fetchFn: typeof fetch = fetch
): Promise<Record<string, string>> {
	if (cache && Date.now() < cache.expiresAt) return cache.map;
	if (inflight) return inflight;

	const baseUrl = env.WOO_API_URL?.replace(/\/$/, '');
	if (!baseUrl) return {};

	inflight = (async () => {
		try {
			const res = await fetchFn(
				`${baseUrl}/wp-json/wp/v2/media?per_page=100&_fields=source_url,media_details`,
				{ signal: AbortSignal.timeout(TIMEOUT_MS) }
			);
			if (!res.ok) throw new Error(`media ${res.status}`);
			const items = (await res.json()) as WpMedia[];
			const map: Record<string, string> = {};
			for (const item of items) {
				const srcset = toSrcset(item);
				if (srcset) map[item.source_url] = srcset;
			}
			cache = { map, expiresAt: Date.now() + TTL_MS };
			return map;
		} catch (err) {
			console.error(
				`[media-srcsets] Sin tamaños alternativos; se servirán los originales: ${err instanceof Error ? err.message : String(err)}`
			);
			cache = { map: {}, expiresAt: Date.now() + TTL_MS };
			return {};
		} finally {
			inflight = null;
		}
	})();

	return inflight;
}
