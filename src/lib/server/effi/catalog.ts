// Convierte los artículos de Effi en productos de la tienda. Función pura (no
// llama a ninguna API) para poder probarla con un volcado real de Effi.
//
// Effi no tiene variaciones: cada talla+color es un artículo aparte. La
// clienta los agrupa poniéndoles el MISMO nombre y codificando la variante en
// la referencia (JOGGER COCOS → JOG-NEG-32, JOG-NEG-34, JOG-GRI-32…). Aquí se
// reconstruye eso: mismo nombre + referencias con el mismo patrón = un
// producto variable con sus tallas/colores; todo lo demás, producto simple.
import type { EffiArticle } from './client';
import {
	COLOR_BY_CODE,
	SIZE_BY_CODE,
	GENDER_BY_EFFI_CATEGORY,
	GENDER_BY_NAME_WORD,
	TYPE_BY_NAME_WORD,
	TYPE_BY_EFFI_CATEGORY,
	FALLBACK_TYPE,
	type GenderSlug
} from './mapping';

export interface CatalogVariant {
	effiId: string;
	sku: string;
	size: string | null;
	color: string | null;
	stock: number;
	price: number;
}

export interface CatalogProduct {
	/** Identidad estable entre sincronizaciones (se guarda como meta en WooCommerce). */
	key: string;
	name: string;
	kind: 'simple' | 'variable';
	gender: GenderSlug;
	type: string;
	/** Fotos de Effi, sin repetir, en el orden de sus artículos. */
	photos: string[];
	/** Se puede vender: Effi lo permite en ventas y tiene precio. */
	sellable: boolean;
	/** En un simple, exactamente una. */
	variants: CatalogVariant[];
}

// Solo "Producto terminado" con control de stock: los "en proceso" son jeans
// sin terminar y los "sin control de stock" no tienen un número confiable.
const SELLABLE_TYPE = 'Producto terminado';
const CONTROLLED_STOCK = new Set(['2', '3', '4', '5']);

const normalizeName = (s: string) => s.toUpperCase().replace(/\s+/g, ' ').trim();

/** "Tarifa normal: 1200.0000; pagina web: 1300.0000" → 1200 */
export function parseNormalPrice(preciosVenta: string | null): number {
	const match = /Tarifa normal:\s*([\d.]+)/i.exec(preciosVenta ?? '');
	const price = match ? Number(match[1]) : 0;
	return Number.isFinite(price) ? Math.round(price) : 0;
}

const SMALL_WORDS = new Set(['de', 'del', 'con', 'y', 'en', 'la', 'el', 'para', 'sin', 'a']);

/** "BODY SURTIDO REF." → "Body Surtido"; los códigos (TY190, 5140) quedan en mayúscula. */
export function prettyName(raw: string): string {
	const cleaned = raw
		.replace(/\s+REF\.?\s*\S*\s*$/i, '') // "… REF." o "… REF. 5140" al final
		.replace(/\s+/g, ' ')
		.trim();
	return cleaned
		.split(' ')
		.map((word, i) => {
			if (/\d/.test(word)) return word.toUpperCase();
			const lower = word.toLowerCase();
			if (i > 0 && SMALL_WORDS.has(lower)) return lower;
			return lower.charAt(0).toUpperCase() + lower.slice(1);
		})
		.join(' ');
}

function detectGender(name: string, category: string | null): GenderSlug {
	for (const [pattern, gender] of GENDER_BY_NAME_WORD) {
		if (pattern.test(name)) return gender;
	}
	return GENDER_BY_EFFI_CATEGORY[category ?? ''] ?? 'mujer';
}

function detectType(name: string, category: string | null): string {
	for (const [pattern, type] of TYPE_BY_NAME_WORD) {
		if (pattern.test(name)) return type;
	}
	return TYPE_BY_EFFI_CATEGORY[category ?? ''] ?? FALLBACK_TYPE;
}

// Tallas numéricas con o sin "T" delante: 32 o T14 (así codifica los jeans).
const NUMERIC_SIZE = /^T?(\d{1,3})$/;
const isSizeCode = (code: string) => NUMERIC_SIZE.test(code) || code in SIZE_BY_CODE;
// "T06" → "6": sin la T ni el cero de relleno.
const sizeLabel = (code: string) => {
	const numeric = NUMERIC_SIZE.exec(code);
	return SIZE_BY_CODE[code] ?? (numeric ? String(Number(numeric[1])) : code);
};
const colorLabel = (code: string) => COLOR_BY_CODE[code] ?? code;

const stockOf = (a: EffiArticle) => Math.max(0, Math.floor(Number(a.stock_empresa) || 0));

/**
 * Si todas las referencias de la familia siguen el mismo patrón BASE-X[-Y],
 * devuelve qué posición es la talla y cuál el color. `null` si no hay un
 * patrón confiable (entonces cada artículo va como producto simple).
 */
function detectPattern(refs: string[]): { sizeAt: number | null; colorAt: number | null } | null {
	const parts = refs.map((r) => r.toUpperCase().split('-'));
	const len = parts[0].length;
	if (len < 2 || parts.some((p) => p.length !== len)) return null;

	let sizeAt: number | null = null;
	let colorAt: number | null = null;
	for (let i = 0; i < len; i++) {
		const values = new Set(parts.map((p) => p[i]));
		if (values.size === 1) continue; // segmento fijo: parte de la base
		if (i === 0) return null; // la base no puede variar
		const allSizes = [...values].every(isSizeCode);
		if (allSizes && sizeAt === null) sizeAt = i;
		else if (!allSizes && colorAt === null) colorAt = i;
		else return null; // dos segmentos de talla o dos de color: ambiguo
	}
	if (sizeAt === null && colorAt === null) return null;

	// Cada combinación talla+color tiene que ser única, o no se pueden distinguir.
	const combos = new Set(parts.map((p) => `${sizeAt === null ? '' : p[sizeAt]}|${colorAt === null ? '' : p[colorAt]}`));
	if (combos.size !== parts.length) return null;
	return { sizeAt, colorAt };
}

export function buildCatalog(articles: EffiArticle[]): CatalogProduct[] {
	const eligible = articles.filter(
		(a) =>
			a.vigente !== '0' &&
			a.tipo_articulo === SELLABLE_TYPE &&
			CONTROLLED_STOCK.has(String(a.gestion_stock))
	);

	// Referencias repetidas o vacías no sirven como SKU (WooCommerce exige SKU
	// único): se desambiguan con el id de Effi.
	const refCount = new Map<string, number>();
	for (const a of eligible) {
		const ref = a.referencia?.trim();
		if (ref) refCount.set(ref, (refCount.get(ref) ?? 0) + 1);
	}
	const skuOf = (a: EffiArticle) => {
		const ref = a.referencia?.trim();
		if (!ref) return `EFFI-${a.id}`;
		return refCount.get(ref)! > 1 ? `${ref}-E${a.id}` : ref;
	};

	const families = new Map<string, EffiArticle[]>();
	for (const a of eligible) {
		const name = normalizeName(a.descripcion);
		families.set(name, [...(families.get(name) ?? []), a]);
	}

	const products: CatalogProduct[] = [];
	const asSimple = (a: EffiArticle): CatalogProduct => {
		const price = parseNormalPrice(a.precios_venta);
		return {
			key: `art:${a.id}`,
			name: prettyName(a.descripcion),
			kind: 'simple',
			gender: detectGender(normalizeName(a.descripcion), a.nombre_categoria),
			type: detectType(normalizeName(a.descripcion), a.nombre_categoria),
			photos: a.url_foto ? [a.url_foto] : [],
			sellable: a.ventas === '1' && price > 0,
			variants: [{ effiId: a.id, sku: skuOf(a), size: null, color: null, stock: stockOf(a), price }]
		};
	};

	const baseOf = (a: EffiArticle) => (a.referencia?.trim().toUpperCase() ?? '').split('-')[0];

	for (const [name, sameName] of families) {
		// Bajo un mismo nombre puede haber varios modelos: "JEAN BOTA RECTA
		// RIGIDO" agrupa 5904-T08…T14 y 5768-T06…T16. Cada base de referencia
		// (lo que va antes del primer guion) es un producto distinto.
		const byBase = new Map<string, EffiArticle[]>();
		for (const a of sameName) byBase.set(baseOf(a), [...(byBase.get(baseOf(a)) ?? []), a]);
		const severalModels = byBase.size > 1;

		for (const [base, members] of byBase) {
			const refs = members.map((a) => a.referencia?.trim() ?? '');
			const pattern =
				members.length > 1 && refs.every(Boolean) ? detectPattern(refs) : null;
			if (!pattern) {
				products.push(...members.map(asSimple));
				continue;
			}
			products.push(
				buildVariable(members, pattern, {
					// Con un solo modelo la clave es solo el nombre, como siempre:
					// así no cambia la identidad de los productos ya creados.
					key: severalModels ? `fam:${name}|${base}` : `fam:${name}`,
					name: prettyName(members[0].descripcion) + (severalModels ? ` ${base}` : '')
				})
			);
		}
	}

	return products;

	function buildVariable(
		members: EffiArticle[],
		pattern: { sizeAt: number | null; colorAt: number | null },
		{ key, name: displayName }: { key: string; name: string }
	): CatalogProduct {
		const name = normalizeName(members[0].descripcion);
		const first = members[0];
		// Una foto por color: en Effi cada talla trae su propia copia de la misma
		// foto (archivos distintos que se ven iguales), así que 5 tallas del mismo
		// color salían como 5 fotos repetidas. Si la familia no varía por color,
		// basta una foto para todo el producto.
		const photoByColor = new Map<string, string>();
		for (const a of members) {
			if (!a.url_foto) continue;
			const parts = a.referencia!.trim().toUpperCase().split('-');
			const colorKey = pattern.colorAt === null ? '' : parts[pattern.colorAt];
			if (!photoByColor.has(colorKey)) photoByColor.set(colorKey, a.url_foto);
		}
		const variants = members.map((a) => {
			const parts = a.referencia!.trim().toUpperCase().split('-');
			return {
				effiId: a.id,
				sku: skuOf(a),
				size: pattern.sizeAt === null ? null : sizeLabel(parts[pattern.sizeAt]),
				color: pattern.colorAt === null ? null : colorLabel(parts[pattern.colorAt]),
				stock: stockOf(a),
				price: parseNormalPrice(a.precios_venta)
			};
		});
		return {
			key,
			name: displayName,
			kind: 'variable',
			gender: detectGender(name, first.nombre_categoria),
			type: detectType(name, first.nombre_categoria),
			photos: [...photoByColor.values()],
			// Una variación sin precio simplemente no se ofrece (ver sync); el
			// producto se puede vender si Effi lo permite y alguna tiene precio.
			sellable: members.some((a) => a.ventas === '1') && variants.some((v) => v.price > 0),
			variants
		};
	}
}
