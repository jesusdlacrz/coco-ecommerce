// Cliente de la API REST de WooCommerce. Solo se ejecuta en el servidor
// (el sufijo ".server.ts" impide que SvelteKit lo incluya en el bundle del
// cliente, manteniendo las API keys fuera del navegador).
import { env } from '$env/dynamic/private';
import type { Color, Product } from '$lib/shared/model/products';
import { sampleProducts } from '$lib/dataProducts/products';
import { describeError } from '$lib/shared/utils/describeError';

// ------------------------------------------------------------------ tipos Woo

interface WooImage {
	src: string;
	alt?: string;
}

interface WooCategory {
	id: number;
	name: string;
	slug: string;
}

interface WooAttribute {
	name: string;
	slug?: string;
	options: string[];
}

interface WooMeta {
	key: string;
	value: unknown;
}

interface WooProduct {
	id: number;
	name: string;
	slug: string;
	sku: string;
	price: string;
	regular_price: string;
	sale_price: string;
	description: string;
	short_description: string;
	stock_status: 'instock' | 'outofstock' | 'onbackorder';
	stock_quantity: number | null;
	images: WooImage[];
	categories: WooCategory[];
	attributes: WooAttribute[];
	meta_data: WooMeta[];
}

// --------------------------------------------------------------- mapeo dominio

// Género se modela como categoría de WooCommerce. Aceptamos slugs en español e
// inglés para no acoplar el frontend a un idioma concreto en el panel.
const GENDER_BY_SLUG: Record<string, Product['gender']> = {
	hombre: 'men',
	hombres: 'men',
	men: 'men',
	man: 'men',
	mujer: 'women',
	mujeres: 'women',
	women: 'women',
	woman: 'women',
	nino: 'boys',
	ninos: 'boys',
	nino_a: 'boys',
	boys: 'boys',
	boy: 'boys',
	nina: 'girls',
	ninas: 'girls',
	girls: 'girls',
	girl: 'girls'
};

// WooCommerce no guarda el hex de un color por defecto (solo su nombre como
// atributo). Mapeamos los nombres más comunes; el resto cae a un gris neutro.
const HEX_BY_COLOR_NAME: Record<string, string> = {
	negro: '#000000',
	blanco: '#FFFFFF',
	gris: '#6B7280',
	'gris oscuro': '#374151',
	azul: '#2563EB',
	'azul marino': '#1E3A8A',
	rojo: '#DC2626',
	verde: '#16A34A',
	amarillo: '#EAB308',
	naranja: '#EA580C',
	rosa: '#EC4899',
	morado: '#7C3AED',
	marron: '#A16207',
	beige: '#D6C7A1'
};

const DIACRITICS = /[̀-ͯ]/g;

function normalize(value: string): string {
	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(DIACRITICS, '') // quitar acentos
		.trim();
}

function detectGender(categories: WooCategory[]): Product['gender'] {
	for (const cat of categories) {
		const gender = GENDER_BY_SLUG[normalize(cat.slug)] ?? GENDER_BY_SLUG[normalize(cat.name)];
		if (gender) return gender;
	}
	return 'women';
}

function pickCategoryLabel(categories: WooCategory[]): string {
	// Preferimos una categoría que NO sea de género (ej. "Camisas") como etiqueta
	// visible; si no hay, usamos la primera disponible.
	const nonGender = categories.find((c) => !GENDER_BY_SLUG[normalize(c.slug)]);
	return (nonGender ?? categories[0])?.name ?? 'Sin categoría';
}

function findAttribute(attributes: WooAttribute[], ...names: string[]): string[] {
	const wanted = names.map(normalize);
	const match = attributes.find(
		(a) => wanted.includes(normalize(a.name)) || wanted.includes(normalize(a.slug ?? ''))
	);
	return match?.options ?? [];
}

function toColors(names: string[]): Color[] {
	return names.map((name) => ({
		name,
		hex: HEX_BY_COLOR_NAME[normalize(name)] ?? '#CCCCCC'
	}));
}

function readMetaNumber(meta: WooMeta[], key: string): number | undefined {
	const entry = meta.find((m) => m.key === key);
	if (entry === undefined) return undefined;
	const num = Number(entry.value);
	return Number.isFinite(num) ? num : undefined;
}

function mapWooProduct(woo: WooProduct): Product {
	// Campos ACF (mayorista). Ver guía de WordPress para los nombres exactos.
	const wholesalePrice = readMetaNumber(woo.meta_data, 'wholesale_price');
	const minOrderQuantity = readMetaNumber(woo.meta_data, 'min_order_quantity') ?? 1;

	return {
		id: woo.slug || String(woo.id),
		name: woo.name,
		price: Number(woo.regular_price || woo.price) || 0,
		wholesalePrice,
		images: woo.images.length ? woo.images.map((img) => img.src) : ['/placeholder.svg'],
		category: pickCategoryLabel(woo.categories),
		gender: detectGender(woo.categories),
		sizes: findAttribute(woo.attributes, 'Talla', 'Tallas', 'Size', 'pa_talla'),
		colors: toColors(findAttribute(woo.attributes, 'Color', 'Colores', 'pa_color')),
		sku: woo.sku,
		minOrderQuantity,
		description: woo.description || woo.short_description || '',
		inStock: woo.stock_status === 'instock',
		stockQuantity: woo.stock_quantity ?? 0
	};
}

// ------------------------------------------------------------------- fetch API

function getConfig(): { baseUrl: string; auth: string } | null {
	const { WOO_API_URL, WOO_CONSUMER_KEY, WOO_CONSUMER_SECRET } = env;
	if (!WOO_API_URL || !WOO_CONSUMER_KEY || !WOO_CONSUMER_SECRET) {
		return null;
	}
	const auth = btoa(`${WOO_CONSUMER_KEY}:${WOO_CONSUMER_SECRET}`);
	return { baseUrl: WOO_API_URL.replace(/\/$/, ''), auth };
}

// Corta la petición si el servidor de WordPress no responde, para no dejar
// colgada la carga de la página. Generoso porque el hosting compartido puede
// tardar en la primera petición (arranque en frío).
const REQUEST_TIMEOUT_MS = 30000;

async function wooRequest<T>(path: string, fetchFn: typeof fetch): Promise<T> {
	const config = getConfig();
	if (!config) {
		throw new Error('WooCommerce no configurado');
	}
	const res = await fetchFn(`${config.baseUrl}/wp-json/wc/v3${path}`, {
		headers: { Authorization: `Basic ${config.auth}` },
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
	if (!res.ok) {
		const detail = await res.text();
		throw new Error(`WooCommerce ${res.status}: ${detail}`);
	}
	return res.json() as Promise<T>;
}


/**
 * Devuelve todos los productos publicados. Si WooCommerce no está configurado
 * (falta el .env) o la API no responde, cae a los productos de ejemplo para que
 * el sitio nunca se rompa durante el setup. El fallo se registra en consola.
 */
export async function getProducts(fetchFn: typeof fetch = fetch): Promise<Product[]> {
	if (!getConfig()) {
		console.warn('[woocommerce] Sin configurar — usando productos de ejemplo.');
		return sampleProducts;
	}
	try {
		const products = await wooRequest<WooProduct[]>(
			'/products?per_page=100&status=publish',
			fetchFn
		);
		return products.map(mapWooProduct);
	} catch (err) {
		console.error(`[woocommerce] Error al traer productos (${describeError(err)}). Usando ejemplos.`);
		return sampleProducts;
	}
}

/**
 * Devuelve un producto por su slug (nuestro `id`). `null` si no existe.
 * Si la API falla, intenta el producto de ejemplo con ese id.
 */
export async function getProduct(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<Product | null> {
	if (!getConfig()) {
		return sampleProducts.find((p) => p.id === id) ?? null;
	}
	try {
		const matches = await wooRequest<WooProduct[]>(
			`/products?slug=${encodeURIComponent(id)}&status=publish`,
			fetchFn
		);
		return matches.length ? mapWooProduct(matches[0]) : null;
	} catch (err) {
		console.error(`[woocommerce] Error al traer el producto "${id}" (${describeError(err)}).`);
		return sampleProducts.find((p) => p.id === id) ?? null;
	}
}
