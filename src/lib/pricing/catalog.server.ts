import type { Product } from '$lib/shared/model/products';
import { getVariationStock } from '$lib/shared/model/stock';
import { getCachedProducts, getCachedProduct } from '$lib/server/products/cache';
import { getApprovedVendorBySlug, getVendorProductOverrides } from '$lib/server/vendors/repository';
import { applyCommission, priceCatalog, isHidden, type VendorPricing } from './commission';
import { displayPrice, priceForSelection } from '$lib/shared/utils/price';
import { MIN_UNITS_PER_PRODUCT } from '$lib/cart/stores/cartStore';

// El objeto `VendorPricing` (comisión global + overrides) se arma y se
// consume por completo dentro de esta función — nunca sale hacia una `load`
// que SvelteKit serialice al cliente. Así el comprador de una revista jamás
// puede leer el % de comisión ni el precio base del vendedor.
async function buildVendorPricing(
	vendorId: string,
	defaultCommissionPercent: number
): Promise<VendorPricing> {
	const overrides = await getVendorProductOverrides(vendorId);
	const overridesByProductId: VendorPricing['overridesByProductId'] = {};
	for (const o of overrides) {
		overridesByProductId[o.productId] = {
			commissionPercent: o.commissionPercent,
			hidden: o.hidden
		};
	}
	return { defaultCommissionPercent, overridesByProductId };
}

// Defensa en la tienda, independiente de cómo esté WooCommerce: aunque un
// producto quede publicado mal (sin variaciones, precio en 0, agotado), nunca
// se lista ni se cobra en $0.

/** Se puede cobrar: tiene precio. */
const hasPrice = (p: Product) => displayPrice(p) > 0;

/**
 * Se muestra en los listados: tiene precio y stock suficiente para cumplir el
 * pedido mínimo por prenda (si no, nadie podría comprarlo).
 */
const isListable = (p: Product) =>
	hasPrice(p) && p.inStock && p.stockQuantity >= MIN_UNITS_PER_PRODUCT;

export async function loadHouseCatalog(fetchFn: typeof fetch): Promise<Product[]> {
	return (await getCachedProducts(fetchFn)).filter(isListable);
}

/** La ficha sí se muestra agotada (alguien puede llegar por un enlace), pero nunca en $0. */
export async function loadHouseProduct(id: string, fetchFn: typeof fetch): Promise<Product | null> {
	const product = await getCachedProduct(id, fetchFn);
	return product && hasPrice(product) ? product : null;
}

export async function loadVendorCatalog(
	vendorSlug: string,
	fetchFn: typeof fetch
): Promise<Product[]> {
	const vendor = await getApprovedVendorBySlug(vendorSlug);
	if (!vendor) return [];
	const pricing = await buildVendorPricing(vendor.id, vendor.commissionPercent);
	const products = await getCachedProducts(fetchFn);
	return priceCatalog(products, pricing).filter(isListable);
}

export async function loadVendorProduct(
	vendorSlug: string,
	productId: string,
	fetchFn: typeof fetch
): Promise<Product | null> {
	const vendor = await getApprovedVendorBySlug(vendorSlug);
	if (!vendor) return null;
	const pricing = await buildVendorPricing(vendor.id, vendor.commissionPercent);
	if (isHidden(productId, pricing)) return null;
	const product = await getCachedProduct(productId, fetchFn);
	return product && hasPrice(product) ? applyCommission(product, pricing) : null;
}

/** Una línea del carrito: el precio depende de la talla/color, no solo del producto. */
export interface CartPriceCheck {
	productId: string;
	size: string | null;
	color: string | null;
}

/** Fichas completas (con precio por talla/color) de los productos de estas líneas. */
async function productsFor(
	checks: CartPriceCheck[],
	fetchFn: typeof fetch
): Promise<Map<string, Product | null>> {
	const ids = [...new Set(checks.map((c) => c.productId))];
	const products = await Promise.all(ids.map((id) => getCachedProduct(id, fetchFn)));
	return new Map(ids.map((id, i) => [id, products[i]]));
}

// Misma revalidación que getVendorCartPrices() pero para el carrito de la
// casa (sin vendedor/comisión) — la usa el checkout para nunca confiar en el
// precio que venga del cliente. Un resultado por línea, en el mismo orden;
// `null` = ya no disponible (el checkout rechaza en vez de cobrar $0).
export async function getHouseCartPrices(
	checks: CartPriceCheck[],
	fetchFn: typeof fetch
): Promise<(number | null)[]> {
	const byId = await productsFor(checks, fetchFn);
	return checks.map(({ productId, size, color }) => {
		const product = byId.get(productId);
		if (!product || !hasPrice(product)) return null;
		const price = priceForSelection(product, size, color);
		return price > 0 ? price : null;
	});
}

// Revalida los precios de un carrito ya guardado en localStorage contra la
// comisión VIGENTE del vendedor. Un resultado por línea; `null` significa "ya
// no existe o está oculta" — el carrito debe eliminar esa prenda.
export async function getVendorCartPrices(
	vendorSlug: string,
	checks: CartPriceCheck[],
	fetchFn: typeof fetch
): Promise<(number | null)[]> {
	const vendor = await getApprovedVendorBySlug(vendorSlug);
	if (!vendor) return checks.map(() => null);

	const pricing = await buildVendorPricing(vendor.id, vendor.commissionPercent);
	const byId = await productsFor(checks, fetchFn);
	return checks.map(({ productId, size, color }) => {
		const product = byId.get(productId);
		if (!product || !hasPrice(product) || isHidden(productId, pricing)) return null;
		const price = priceForSelection(applyCommission(product, pricing), size, color);
		return price > 0 ? price : null;
	});
}

export interface CartStockCheck {
	productId: string;
	size: string | null;
	color: string | null;
}

// El stock (a diferencia del precio) es el mismo sin importar el vendedor —
// es la misma prenda física. Se usa desde el checkout para rechazar antes de
// cobrar una cantidad que ya no existe en esa talla/color; es sobre la
// caché, así que un cambio de stock hecho en WordPress hace efecto en el
// checkout con el mismo retraso que ya tiene el catálogo (ver
// `$lib/server/products/cache`), no en tiempo real.
export async function getCartStock(
	checks: CartStockCheck[],
	fetchFn: typeof fetch
): Promise<number[]> {
	// Fichas completas (con stock por talla/color) solo de los productos del
	// carrito: el listado cacheado ya no trae variaciones.
	const ids = [...new Set(checks.map((c) => c.productId))];
	const products = await Promise.all(ids.map((id) => getCachedProduct(id, fetchFn)));
	const byId = new Map(ids.map((id, i) => [id, products[i]]));
	return checks.map(({ productId, size, color }) => {
		const product = byId.get(productId);
		return product ? getVariationStock(product, size, color) : 0;
	});
}
