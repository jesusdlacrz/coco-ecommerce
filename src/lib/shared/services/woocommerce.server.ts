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
// atributo). Mapeamos la mayor cantidad posible de nombres usados en moda; el
// resto (uno que no esté aquí) cae a un gris neutro en `toColors()`.
const HEX_BY_COLOR_NAME: Record<string, string> = {
	// Neutros
	negro: '#000000',
	blanco: '#FFFFFF',
	'blanco roto': '#F5F1E8',
	gris: '#6B7280',
	'gris claro': '#D1D5DB',
	'gris oscuro': '#374151',
	'gris perla': '#C7C7CC',
	plata: '#C0C0C0',
	plateado: '#C0C0C0',
	crema: '#FFFDD0',
	marfil: '#FFFFF0',
	beige: '#D6C7A1',
	arena: '#D9C6A5',
	caqui: '#8B8767',
	khaki: '#8B8767',
	topo: '#8D7B68',
	taupe: '#8D7B68',

	// Marrones / tierra
	marron: '#A16207',
	cafe: '#6F4E37',
	chocolate: '#5C3A21',
	camel: '#C19A6B',
	cognac: '#9A463D',
	tabaco: '#6B4423',
	oxido: '#B7410E',
	terracota: '#C6693B',
	mostaza: '#D4A017',

	// Azules
	azul: '#2563EB',
	'azul marino': '#1E3A8A',
	'azul rey': '#1D4ED8',
	'azul cielo': '#7DD3FC',
	celeste: '#7DD3FC',
	'azul petroleo': '#0F4C5C',
	'azul acero': '#4682B4',
	turquesa: '#14B8A6',
	aqua: '#22D3D3',
	cian: '#06B6D4',

	// Verdes
	verde: '#16A34A',
	'verde oliva': '#556B2F',
	oliva: '#556B2F',
	'verde militar': '#4B5320',
	'verde botella': '#065F46',
	'verde menta': '#86EFAC',
	menta: '#86EFAC',
	'verde esmeralda': '#059669',
	esmeralda: '#059669',
	'verde limon': '#A3E635',

	// Rojos / rosas
	rojo: '#DC2626',
	'rojo vino': '#7F1D1D',
	vino: '#7F1D1D',
	'vino tinto': '#7F1D1D',
	guinda: '#7F1D1D',
	borgona: '#800020',
	granate: '#800020',
	burdeos: '#800020',
	coral: '#FF7F6B',
	salmon: '#FA8072',
	rosa: '#EC4899',
	rosado: '#EC4899',
	'rosa palo': '#E8B4B8',
	'rosa pastel': '#F9CFE0',
	fucsia: '#D6006D',
	magenta: '#C2185B',

	// Morados
	morado: '#7C3AED',
	lila: '#C4A7E7',
	lavanda: '#B497D6',
	violeta: '#7C3AED',
	purpura: '#6D28D9',
	ciruela: '#6B3346',

	// Amarillos / naranjas
	amarillo: '#EAB308',
	dorado: '#D4AF37',
	oro: '#D4AF37',
	naranja: '#EA580C',
	melocoton: '#FFCBA4',
	durazno: '#FFCBA4'
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

// Umbral mínimo para la coincidencia parcial: evita que una clave corta como
// "oro" o "vino" dispare falsos positivos dentro de una palabra no relacionada.
const FUZZY_MATCH_MIN_LENGTH = 4;

function resolveColorHex(name: string): string {
	const normalized = normalize(name);
	const exact = HEX_BY_COLOR_NAME[normalized];
	if (exact) return exact;

	// El vendedor puede escribir variantes que no están en el diccionario
	// ("rosado", "azulado", "rosa viejo"): buscamos si alguna palabra base
	// conocida está contenida en el nombre, o el nombre en una clave compuesta.
	for (const [key, hex] of Object.entries(HEX_BY_COLOR_NAME)) {
		if (key.length < FUZZY_MATCH_MIN_LENGTH) continue;
		if (normalized.includes(key) || key.includes(normalized)) return hex;
	}

	return '#CCCCCC';
}

function toColors(names: string[], swatches: Map<string, string>): Color[] {
	return names.map((name) => ({
		name,
		// El hex real elegido en WordPress manda; el diccionario/búsqueda difusa
		// es solo el respaldo para colores que el vendedor aún no configuró ahí.
		hex: swatches.get(normalize(name)) ?? resolveColorHex(name)
	}));
}

function readMetaNumber(meta: WooMeta[], key: string): number | undefined {
	const entry = meta.find((m) => m.key === key);
	if (entry === undefined) return undefined;
	const num = Number(entry.value);
	return Number.isFinite(num) ? num : undefined;
}

function mapWooProduct(woo: WooProduct, swatches: Map<string, string>): Product {
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
		colors: toColors(findAttribute(woo.attributes, 'Color', 'Colores', 'pa_color'), swatches),
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

async function wooRequest<T>(
	path: string,
	fetchFn: typeof fetch,
	init?: { method?: string; body?: unknown }
): Promise<T> {
	const config = getConfig();
	if (!config) {
		throw new Error('WooCommerce no configurado');
	}
	const res = await fetchFn(`${config.baseUrl}/wp-json/wc/v3${path}`, {
		method: init?.method ?? 'GET',
		headers: {
			Authorization: `Basic ${config.auth}`,
			...(init?.body ? { 'Content-Type': 'application/json' } : {})
		},
		body: init?.body ? JSON.stringify(init.body) : undefined,
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
	if (!res.ok) {
		const detail = await res.text();
		throw new Error(`WooCommerce ${res.status}: ${detail}`);
	}
	return res.json() as Promise<T>;
}


interface WooColorSwatch {
	name?: string;
	hex?: string;
}

/**
 * Trae el hex real de cada término de color, elegido en WordPress con un
 * selector de color (no adivinado). Si el endpoint no existe o falla, devuelve
 * un mapa vacío — `toColors()` cae entonces al diccionario/búsqueda difusa.
 */
async function fetchColorSwatches(fetchFn: typeof fetch): Promise<Map<string, string>> {
	const config = getConfig();
	if (!config) return new Map();
	try {
		const res = await fetchFn(`${config.baseUrl}/wp-json/coco/v1/color-swatches`, {
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
		});
		if (!res.ok) {
			throw new Error(`color-swatches ${res.status}: ${await res.text()}`);
		}
		const raw = (await res.json()) as WooColorSwatch[];
		const swatches = new Map<string, string>();
		for (const { name, hex } of raw) {
			if (name && hex) swatches.set(normalize(name), hex);
		}
		return swatches;
	} catch (err) {
		console.error(
			`[woocommerce] Error al traer los colores reales de WordPress (${describeError(err)}). Usando el diccionario de respaldo.`
		);
		return new Map();
	}
}

// Error específico para poder distinguir "no configurado" (setup local sin
// .env) de un fallo real de red al decidir el TTL de la caché.
export class WooNotConfiguredError extends Error {}

/**
 * Trae los productos publicados directo de WooCommerce, sin fallback. Lanza
 * si no está configurado o si la API falla — lo usa la caché en
 * `$lib/server/products/cache.ts` para decidir cuánto reintentar.
 */
export async function fetchProductsOrThrow(fetchFn: typeof fetch = fetch): Promise<Product[]> {
	if (!getConfig()) {
		throw new WooNotConfiguredError('WooCommerce no configurado');
	}
	const [products, swatches] = await Promise.all([
		wooRequest<WooProduct[]>('/products?per_page=100&status=publish', fetchFn),
		fetchColorSwatches(fetchFn)
	]);
	return products.map((product) => mapWooProduct(product, swatches));
}

/**
 * Devuelve todos los productos publicados. Si WooCommerce no está configurado
 * (falta el .env) o la API no responde, cae a los productos de ejemplo para que
 * el sitio nunca se rompa durante el setup. El fallo se registra en consola.
 */
export async function getProducts(fetchFn: typeof fetch = fetch): Promise<Product[]> {
	try {
		return await fetchProductsOrThrow(fetchFn);
	} catch (err) {
		if (err instanceof WooNotConfiguredError) {
			console.warn('[woocommerce] Sin configurar — usando productos de ejemplo.');
		} else {
			console.error(`[woocommerce] Error al traer productos (${describeError(err)}). Usando ejemplos.`);
		}
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
		const [matches, swatches] = await Promise.all([
			wooRequest<WooProduct[]>(`/products?slug=${encodeURIComponent(id)}&status=publish`, fetchFn),
			fetchColorSwatches(fetchFn)
		]);
		return matches.length ? mapWooProduct(matches[0], swatches) : null;
	} catch (err) {
		console.error(`[woocommerce] Error al traer el producto "${id}" (${describeError(err)}).`);
		return sampleProducts.find((p) => p.id === id) ?? null;
	}
}

// ------------------------------------------------------------------- pedidos

/**
 * El carrito solo guarda el slug (nuestro `Product.id`), pero la API de
 * pedidos de WooCommerce exige el `product_id` numérico real en cada
 * line_item. Se resuelve al momento de crear el pedido (webhook, no en el
 * camino crítico del checkout) en vez de exponer el id numérico en todo el
 * modelo `Product` solo para este único uso.
 */
export async function resolveWooProductId(
	slug: string,
	fetchFn: typeof fetch = fetch
): Promise<number> {
	const matches = await wooRequest<WooProduct[]>(
		`/products?slug=${encodeURIComponent(slug)}`,
		fetchFn
	);
	if (!matches.length) {
		throw new Error(`No se encontró el producto "${slug}" en WooCommerce`);
	}
	return matches[0].id;
}

export interface CreateOrderLineItem {
	productId: number;
	quantity: number;
	total: string; // precio ya ajustado por comisión, forzado explícito (ver createOrder)
	meta: { key: string; value: string }[];
}

export interface CreateOrderAddress {
	firstName: string;
	lastName: string;
	email?: string;
	phone: string;
	address: string;
	addressComplement: string; // apto, torre, interior, bloque
	dwellingType: string; // Casa / Apartamento / Otro
	city: string;
	postalCode: string;
	country: string; // ISO 3166-1 alpha-2
}

export interface CreateOrderInput {
	reference: string;
	vendorSlug: string | null;
	lineItems: CreateOrderLineItem[];
	shippingTotal: string;
	billing: CreateOrderAddress;
}

interface WooOrderResponse {
	id: number;
	status: string;
}

/**
 * Crea el pedido real en WooCommerce. Se llama solo desde el webhook de
 * Wompi, una vez confirmado el pago — nunca antes.
 *
 * `subtotal`/`total` se fuerzan explícitamente en cada line_item: si no se
 * mandan, WooCommerce recalcula con el precio base del producto (sin la
 * comisión del vendedor) y el total del pedido dejaría de cuadrar con lo
 * cobrado en Wompi.
 */
export async function createOrder(
	input: CreateOrderInput,
	fetchFn: typeof fetch = fetch
): Promise<{ id: number; status: string }> {
	const payload = {
		status: 'processing',
		payment_method: 'wompi',
		payment_method_title: 'Wompi',
		set_paid: true,
		billing: {
			first_name: input.billing.firstName,
			last_name: input.billing.lastName,
			email: input.billing.email,
			phone: input.billing.phone,
			address_1: input.billing.address,
			address_2: input.billing.addressComplement,
			city: input.billing.city,
			postcode: input.billing.postalCode,
			country: input.billing.country
		},
		shipping: {
			first_name: input.billing.firstName,
			last_name: input.billing.lastName,
			phone: input.billing.phone,
			address_1: input.billing.address,
			address_2: input.billing.addressComplement,
			city: input.billing.city,
			postcode: input.billing.postalCode,
			country: input.billing.country
		},
		line_items: input.lineItems.map((item) => ({
			product_id: item.productId,
			quantity: item.quantity,
			subtotal: item.total,
			total: item.total,
			meta_data: item.meta.map((m) => ({ key: m.key, value: m.value }))
		})),
		shipping_lines: [
			{ method_id: 'flat_rate', method_title: 'Envío', total: input.shippingTotal }
		],
		meta_data: [
			{ key: '_wompi_reference', value: input.reference },
			{ key: '_vendor_slug', value: input.vendorSlug ?? '' },
			{ key: '_dwelling_type', value: input.billing.dwellingType }
		]
	};
	return wooRequest<WooOrderResponse>('/orders', fetchFn, { method: 'POST', body: payload });
}
