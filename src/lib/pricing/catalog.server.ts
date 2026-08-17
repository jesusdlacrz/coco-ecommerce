import type { Product } from '$lib/shared/model/products';
import { getCachedProducts, getCachedProduct } from '$lib/server/products/cache';
import { getApprovedVendorBySlug, getVendorProductOverrides } from '$lib/server/vendors/repository';
import { applyCommission, priceCatalog, isHidden, type VendorPricing } from './commission';
import { displayPrice } from '$lib/shared/utils/price';

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

export async function loadHouseCatalog(fetchFn: typeof fetch): Promise<Product[]> {
	return getCachedProducts(fetchFn);
}

export async function loadHouseProduct(id: string, fetchFn: typeof fetch): Promise<Product | null> {
	return getCachedProduct(id, fetchFn);
}

export async function loadVendorCatalog(
	vendorSlug: string,
	fetchFn: typeof fetch
): Promise<Product[]> {
	const vendor = await getApprovedVendorBySlug(vendorSlug);
	if (!vendor) return [];
	const pricing = await buildVendorPricing(vendor.id, vendor.commissionPercent);
	const products = await getCachedProducts(fetchFn);
	return priceCatalog(products, pricing);
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
	return product ? applyCommission(product, pricing) : null;
}

// Revalida los precios de un carrito ya guardado en localStorage contra la
// comisión VIGENTE del vendedor. `null` en el resultado significa "ya no
// existe o está oculta" — el carrito debe eliminar esa prenda.
export async function getVendorCartPrices(
	vendorSlug: string,
	productIds: string[],
	fetchFn: typeof fetch
): Promise<Record<string, number | null>> {
	const vendor = await getApprovedVendorBySlug(vendorSlug);
	if (!vendor) return Object.fromEntries(productIds.map((id) => [id, null]));

	const pricing = await buildVendorPricing(vendor.id, vendor.commissionPercent);
	const products = await getCachedProducts(fetchFn);
	const byId = new Map(products.map((p) => [p.id, p]));

	const result: Record<string, number | null> = {};
	for (const id of productIds) {
		const product = byId.get(id);
		if (!product || isHidden(id, pricing)) {
			result[id] = null;
			continue;
		}
		result[id] = displayPrice(applyCommission(product, pricing));
	}
	return result;
}
