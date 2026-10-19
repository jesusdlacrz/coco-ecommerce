// Sincroniza el catálogo de Effi (stock, precio, fotos) hacia WooCommerce,
// que sigue siendo de donde lee la tienda. Effi manda en stock y precio;
// WordPress manda en nombre, descripción, categorías y en las fotos que la
// clienta suba a mano. Ver EFFI-SETUP.md.
//
// Escribe en WooCommerce sin coordinarse con otras ejecuciones: quien la
// llame con dryRun=false debe hacerlo dentro de `runExclusive` (lock.ts), o
// dos ejecuciones simultáneas crearían el mismo producto dos veces.
import { wooRequest, wooRequestAll } from '$lib/shared/services/woocommerce.server';
import { MIN_UNITS_PER_PRODUCT } from '$lib/cart/stores/cartStore';
import { sortSizes } from '$lib/shared/model/sizes';
import { invalidateProductsCache } from '$lib/server/products/cache';
import { describeError } from '$lib/shared/utils/describeError';
import { fetchAllArticles } from './client';
import { buildCatalog, type CatalogProduct, type CatalogVariant } from './catalog';

/** Identidad del producto de Effi (ver `CatalogProduct.key`). Sin ella, el producto no es de Effi y no se toca. */
const META_KEY = '_effi_key';
/** Fotos de Effi que la sincronización puso, para saber si cambiaron. */
const META_PHOTOS = '_effi_photos';
/** Ids de esas imágenes en WordPress: si ya no coinciden, la clienta las cambió a mano y se respetan. */
const META_IMAGE_IDS = '_effi_image_ids';

// Crear con fotos es lento (WordPress descarga cada imagen de Effi): lotes chicos.
const CREATE_BATCH = 10;
const UPDATE_BATCH = 50;
const WRITE_TIMEOUT_MS = 120_000;

type Status = 'publish' | 'draft';

interface WooMeta {
	key: string;
	value: unknown;
}

interface WooAdminProduct {
	id: number;
	name: string;
	type: string;
	status: string;
	regular_price: string;
	stock_quantity: number | null;
	images: { id: number }[];
	attributes: { id: number; name: string; options: string[]; variation: boolean; visible: boolean }[];
	meta_data: WooMeta[];
}

interface WooAdminVariation {
	id: number;
	sku: string;
	regular_price: string;
	stock_quantity: number | null;
	attributes: { id: number; option: string }[];
}

/** Firma comparable de los atributos de una variación (sin mayúsculas ni orden). */
const variationAttrsKey = (attrs: { id: number; option: string }[]) =>
	attrs
		.map((a) => `${a.id}:${a.option.toLowerCase()}`)
		.sort()
		.join('|');

interface WooTerm {
	id: number;
	name: string;
	slug: string;
}

interface WooBatchResult {
	create?: (WooAdminProduct & { error?: { message: string } })[];
	update?: (WooAdminProduct & { error?: { message: string } })[];
}

export interface SyncReport {
	dryRun: boolean;
	effiArticles: number;
	catalogProducts: number;
	created: string[];
	updated: string[];
	published: string[];
	hidden: string[];
	/** Productos de Effi que ya existen y no cambiaron (las variaciones se revisan aparte). */
	unchanged: number;
	/** Referencias de Effi sin stock que nunca se crearon en la tienda. */
	skippedNoStock: number;
	/** Productos que creó la sincronización y ya no corresponden a nada en Effi (a la papelera). */
	trashed: string[];
	errors: string[];
	durationMs: number;
}

const metaValue = (p: WooAdminProduct, key: string) =>
	String(p.meta_data.find((m) => m.key === key)?.value ?? '');

const chunk = <T>(items: T[], size: number): T[][] =>
	Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));

const sameIds = (a: number[], b: number[]) => a.length === b.length && a.every((id, i) => id === b[i]);

/**
 * Unidades ya vendidas en la web que todavía no se despachan (pedido en
 * "Procesando" o "En espera"). Hasta que las ventas web lleguen solas a Effi
 * (fase 2), la clienta las registra allá a mano; mientras tanto se restan del
 * stock de Effi para no volver a ofrecer lo que ya se vendió. Al marcar el
 * pedido como "Completado" deja de restarse (para entonces ya está en Effi).
 */
async function fetchReservedBySku(fetchFn: typeof fetch): Promise<Map<string, number>> {
	const orders = await wooRequestAll<{ line_items: { sku: string; quantity: number }[] }>(
		'/orders?status=processing,on-hold',
		fetchFn
	);
	const reserved = new Map<string, number>();
	for (const order of orders) {
		for (const item of order.line_items) {
			if (item.sku) reserved.set(item.sku, (reserved.get(item.sku) ?? 0) + item.quantity);
		}
	}
	return reserved;
}

export async function syncEffiToWoo(
	{ dryRun }: { dryRun: boolean },
	fetchFn: typeof fetch = fetch
): Promise<SyncReport> {
	const started = Date.now();
	const report: SyncReport = {
		dryRun,
		effiArticles: 0,
		catalogProducts: 0,
		created: [],
		updated: [],
		published: [],
		hidden: [],
		unchanged: 0,
		skippedNoStock: 0,
		trashed: [],
		errors: [],
		durationMs: 0
	};

	const [articles, wooProducts, reserved, attributes, categories] = await Promise.all([
		fetchAllArticles(fetchFn),
		wooRequestAll<WooAdminProduct>('/products?status=any', fetchFn),
		fetchReservedBySku(fetchFn),
		wooRequest<WooTerm[]>('/products/attributes', fetchFn),
		wooRequestAll<WooTerm>('/products/categories', fetchFn)
	]);
	const catalog = buildCatalog(articles);
	report.effiArticles = articles.length;
	report.catalogProducts = catalog.length;

	const sizeAttr = attributes.find((a) => a.slug === 'pa_talla');
	const colorAttr = attributes.find((a) => a.slug === 'pa_color');
	if (!sizeAttr || !colorAttr) {
		throw new Error('Faltan los atributos globales Talla (pa_talla) y Color (pa_color) en WooCommerce');
	}
	const sizeAttrId = sizeAttr.id;
	const colorAttrId = colorAttr.id;

	const existingByKey = new Map<string, WooAdminProduct>();
	for (const p of wooProducts) {
		const key = metaValue(p, META_KEY);
		if (key) existingByKey.set(key, p);
	}

	// ---------------------------------------------------------- categorías
	const categoryIdByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
	const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));
	async function categoryId(name: string): Promise<number | null> {
		const known = categoryIdByName.get(name.toLowerCase());
		if (known) return known;
		if (dryRun) return null;
		const created = await wooRequest<WooTerm>('/products/categories', fetchFn, {
			method: 'POST',
			body: { name }
		});
		categoryIdByName.set(name.toLowerCase(), created.id);
		return created.id;
	}
	async function categoriesFor(p: CatalogProduct) {
		const ids = [categoryIdBySlug.get(p.gender), await categoryId(p.type)];
		return ids.filter((id): id is number => typeof id === 'number').map((id) => ({ id }));
	}

	// ------------------------------------------------------------- reglas
	const available = (v: CatalogVariant) =>
		v.price > 0 ? Math.max(0, v.stock - (reserved.get(v.sku) ?? 0)) : 0;
	const totalAvailable = (p: CatalogProduct) => p.variants.reduce((s, v) => s + available(v), 0);
	const decideStatus = (p: CatalogProduct, hasImage: boolean): Status =>
		p.sellable && hasImage && totalAvailable(p) >= MIN_UNITS_PER_PRODUCT ? 'publish' : 'draft';

	const variantAttributes = (v: CatalogVariant) => [
		...(v.size ? [{ id: sizeAttrId, option: v.size }] : []),
		...(v.color ? [{ id: colorAttrId, option: v.color }] : [])
	];
	// En un producto de Effi las tallas y colores los define Effi (sus
	// referencias): se reemplazan, no se unen con lo que haya, o un cambio de
	// criterio (ej. "T22" pasó de leerse como color a talla) nunca se corregiría.
	function parentAttributes(p: CatalogProduct) {
		const unique = (values: (string | null)[]) => [
			...new Set(values.filter((v): v is string => Boolean(v)))
		];
		const sizes = sortSizes(unique(p.variants.map((v) => v.size)));
		const colors = unique(p.variants.map((v) => v.color));
		return [
			...(sizes.length ? [{ id: sizeAttrId, options: sizes, variation: true, visible: true }] : []),
			...(colors.length ? [{ id: colorAttrId, options: colors, variation: true, visible: true }] : [])
		];
	}

	const track = (p: CatalogProduct, status: Status, prevStatus?: string) => {
		if (status === 'publish' && prevStatus !== 'publish') report.published.push(p.name);
		if (status === 'draft' && prevStatus === 'publish') report.hidden.push(p.name);
	};

	// ------------------------------------------------------- planificación
	const creates: { product: CatalogProduct; payload: Record<string, unknown> }[] = [];
	const updates: { name: string; payload: Record<string, unknown>; photos?: string[] }[] = [];
	const variableSyncs: { product: CatalogProduct; wooId: number }[] = [];

	for (const p of catalog) {
		const existing = existingByKey.get(p.key);
		const photosMeta = p.photos.join('|');

		if (!existing) {
			// No se crean productos que nunca tuvieron stock: solo llenarían el panel.
			if (totalAvailable(p) === 0) {
				report.skippedNoStock++;
				continue;
			}
			const status = decideStatus(p, p.photos.length > 0);
			const base = {
				name: p.name,
				status,
				categories: await categoriesFor(p),
				images: p.photos.map((src) => ({ src })),
				meta_data: [
					{ key: META_KEY, value: p.key },
					{ key: META_PHOTOS, value: photosMeta }
				]
			};
			creates.push({
				product: p,
				payload:
					p.kind === 'simple'
						? {
								...base,
								type: 'simple',
								sku: p.variants[0].sku,
								regular_price: String(p.variants[0].price),
								manage_stock: true,
								stock_quantity: available(p.variants[0])
							}
						: { ...base, type: 'variable', attributes: parentAttributes(p) }
			});
			track(p, status);
			continue;
		}

		// ¿Las imágenes siguen siendo las que puso la sincronización? Si la
		// clienta subió o cambió fotos en WordPress, no se tocan.
		const currentIds = existing.images.map((i) => i.id);
		const recordedIds = metaValue(existing, META_IMAGE_IDS).split(',').filter(Boolean).map(Number);
		const imagesManaged = currentIds.length === 0 || sameIds(currentIds, recordedIds);
		const replacePhotos = imagesManaged && metaValue(existing, META_PHOTOS) !== photosMeta;
		const hasImage = replacePhotos ? p.photos.length > 0 : currentIds.length > 0;

		const status = decideStatus(p, hasImage);
		const payload: Record<string, unknown> = {};
		if (existing.status !== status) payload.status = status;
		if (replacePhotos) {
			payload.images = p.photos.map((src) => ({ src }));
			payload.meta_data = [{ key: META_PHOTOS, value: photosMeta }];
		}
		if (p.kind === 'simple') {
			const v = p.variants[0];
			if (existing.stock_quantity !== available(v)) {
				payload.manage_stock = true;
				payload.stock_quantity = available(v);
			}
			if (existing.regular_price !== String(v.price)) payload.regular_price = String(v.price);
		} else {
			const attrs = parentAttributes(p);
			// WordPress reutiliza términos que ya existían con otra mayúscula
			// ("fucsia" vs "Fucsia") y puede reordenarlos: se compara sin eso,
			// o cada sincronización reescribiría los atributos.
			const optionsOf = (list: { id: number; options: string[] }[]) =>
				JSON.stringify(
					list.map((a) => [a.id, a.options.map((o) => o.toLowerCase()).sort()]).sort()
				);
			if (optionsOf(attrs) !== optionsOf(existing.attributes.filter((a) => a.variation))) {
				payload.attributes = attrs;
			}
			variableSyncs.push({ product: p, wooId: existing.id });
		}

		if (Object.keys(payload).length) {
			updates.push({ name: p.name, payload: { id: existing.id, ...payload }, photos: replacePhotos ? p.photos : undefined });
			report.updated.push(p.name);
			track(p, status, existing.status);
		} else {
			report.unchanged++;
		}
	}

	// Productos de Effi que ya no están en su catálogo (anulados, pasaron a "en
	// proceso", o se reagruparon: tallas sueltas que ahora son un producto con
	// variaciones). Si nadie los tocó en WordPress van a la papelera (se pueden
	// recuperar desde ahí); si la clienta les subió fotos, solo se ocultan.
	const catalogKeys = new Set(catalog.map((p) => p.key));
	const toTrash: WooAdminProduct[] = [];
	for (const [key, existing] of existingByKey) {
		if (catalogKeys.has(key)) continue;
		const recordedIds = metaValue(existing, META_IMAGE_IDS).split(',').filter(Boolean).map(Number);
		const untouched =
			existing.images.length === 0 || sameIds(existing.images.map((i) => i.id), recordedIds);
		if (untouched) {
			toTrash.push(existing);
			report.trashed.push(existing.name);
		} else if (existing.status !== 'draft') {
			updates.push({ name: existing.name, payload: { id: existing.id, status: 'draft' } });
			report.hidden.push(existing.name);
		}
	}

	report.created = creates.map((c) => c.product.name);

	if (dryRun) {
		report.durationMs = Date.now() - started;
		return report;
	}

	// ------------------------------------------------------------ escritura
	/** Guarda qué ids de imagen quedaron, para reconocer después si la clienta las cambió. */
	const imageIdsMeta = (p: WooAdminProduct) => ({
		id: p.id,
		meta_data: [{ key: META_IMAGE_IDS, value: p.images.map((i) => i.id).join(',') }]
	});
	const imageMetaUpdates: Record<string, unknown>[] = [];
	const createdVariables: { product: CatalogProduct; wooId: number }[] = [];

	for (const group of chunk(creates, CREATE_BATCH)) {
		try {
			const res = await wooRequest<WooBatchResult>('/products/batch', fetchFn, {
				method: 'POST',
				body: { create: group.map((c) => c.payload) },
				timeoutMs: WRITE_TIMEOUT_MS
			});
			(res.create ?? []).forEach((created, i) => {
				const { product } = group[i];
				if (created.error) {
					report.errors.push(`Crear "${product.name}": ${created.error.message}`);
					return;
				}
				if (created.images.length) imageMetaUpdates.push(imageIdsMeta(created));
				if (product.kind === 'variable') createdVariables.push({ product, wooId: created.id });
			});
		} catch (err) {
			report.errors.push(`Lote de creación (${group.map((c) => c.product.name).join(', ')}): ${describeError(err)}`);
		}
	}

	for (const group of chunk(updates, UPDATE_BATCH)) {
		try {
			const res = await wooRequest<WooBatchResult>('/products/batch', fetchFn, {
				method: 'POST',
				body: { update: group.map((u) => u.payload) },
				timeoutMs: WRITE_TIMEOUT_MS
			});
			(res.update ?? []).forEach((updated, i) => {
				if (updated.error) report.errors.push(`Actualizar "${group[i].name}": ${updated.error.message}`);
				else if (group[i].photos) imageMetaUpdates.push(imageIdsMeta(updated));
			});
		} catch (err) {
			report.errors.push(`Lote de actualización: ${describeError(err)}`);
		}
	}

	// DELETE sin `force` = mover a la papelera (recuperable desde WordPress).
	for (const product of toTrash) {
		try {
			await wooRequest(`/products/${product.id}`, fetchFn, { method: 'DELETE' });
		} catch (err) {
			report.errors.push(`Mover a la papelera "${product.name}": ${describeError(err)}`);
		}
	}

	for (const group of chunk(imageMetaUpdates, UPDATE_BATCH)) {
		try {
			await wooRequest('/products/batch', fetchFn, { method: 'POST', body: { update: group } });
		} catch (err) {
			report.errors.push(`Guardar ids de imágenes: ${describeError(err)}`);
		}
	}

	// Variaciones: una por artículo de Effi, emparejadas por SKU (= referencia).
	for (const { product, wooId } of [...createdVariables, ...variableSyncs]) {
		try {
			const current = await wooRequestAll<WooAdminVariation>(`/products/${wooId}/variations`, fetchFn);
			const bySku = new Map(current.map((v) => [v.sku, v]));
			const create: Record<string, unknown>[] = [];
			const update: Record<string, unknown>[] = [];
			for (const v of product.variants) {
				const stock = available(v);
				const existing = bySku.get(v.sku);
				if (!existing) {
					create.push({
						sku: v.sku,
						regular_price: String(v.price),
						manage_stock: true,
						stock_quantity: stock,
						attributes: variantAttributes(v)
					});
				} else {
					const attrs = variantAttributes(v);
					const attrsChanged = variationAttrsKey(existing.attributes) !== variationAttrsKey(attrs);
					if (attrsChanged || existing.stock_quantity !== stock || existing.regular_price !== String(v.price)) {
						update.push({
							id: existing.id,
							regular_price: String(v.price),
							manage_stock: true,
							stock_quantity: stock,
							...(attrsChanged ? { attributes: attrs } : {})
						});
					}
				}
			}
			// Variaciones cuyo artículo ya no está en Effi: en 0 (no se borran).
			const catalogSkus = new Set(product.variants.map((v) => v.sku));
			for (const v of current) {
				if (!catalogSkus.has(v.sku) && v.stock_quantity !== 0) update.push({ id: v.id, manage_stock: true, stock_quantity: 0 });
			}
			for (const part of chunk([...create.map((c) => ['create', c] as const), ...update.map((u) => ['update', u] as const)], 100)) {
				const body = {
					create: part.filter(([op]) => op === 'create').map(([, p]) => p),
					update: part.filter(([op]) => op === 'update').map(([, p]) => p)
				};
				const res = await wooRequest<WooBatchResult>(`/products/${wooId}/variations/batch`, fetchFn, {
					method: 'POST',
					body,
					timeoutMs: WRITE_TIMEOUT_MS
				});
				for (const r of [...(res.create ?? []), ...(res.update ?? [])]) {
					if (r.error) report.errors.push(`Variación de "${product.name}": ${r.error.message}`);
				}
			}
			// El padre no cambió (se contó como "sin cambios") pero sus variaciones sí.
			if ((create.length || update.length) && !report.updated.includes(product.name) && !report.created.includes(product.name)) {
				report.updated.push(product.name);
				report.unchanged--;
			}
		} catch (err) {
			report.errors.push(`Variaciones de "${product.name}": ${describeError(err)}`);
		}
	}

	invalidateProductsCache();
	report.durationMs = Date.now() - started;
	return report;
}
