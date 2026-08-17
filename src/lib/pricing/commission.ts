import type { Product } from '$lib/shared/model/products';

export interface VendorProductSetting {
	commissionPercent: number | null; // null = usa el % global del vendedor
	hidden: boolean;
}

export interface VendorPricing {
	defaultCommissionPercent: number;
	overridesByProductId: Record<string, VendorProductSetting>;
}

// Los precios se muestran en pesos colombianos: redondeamos a la centena para
// no exhibir cifras como $128.347.
const ROUNDING_STEP = 100;

function roundCop(value: number): number {
	return Math.round(value / ROUNDING_STEP) * ROUNDING_STEP;
}

// Misma fórmula que usa `applyCommission` sobre un precio suelto — la usa el
// panel de comisiones para calcular el precio final en vivo mientras el
// vendedor edita, con cero deriva respecto al precio que verá su cliente.
export function priceWithCommission(basePrice: number, percent: number): number {
	if (!percent) return basePrice;
	return roundCop(basePrice * (1 + percent / 100));
}

export function commissionFor(productId: string, pricing: VendorPricing): number {
	const override = pricing.overridesByProductId[productId]?.commissionPercent;
	return typeof override === 'number' ? override : pricing.defaultCommissionPercent;
}

export function isHidden(productId: string, pricing: VendorPricing): boolean {
	return pricing.overridesByProductId[productId]?.hidden ?? false;
}

/**
 * Devuelve una copia del producto con la comisión del vendedor aplicada. La
 * comisión multiplica `price` y `wholesalePrice` por el mismo factor: así se
 * conserva el porcentaje de ahorro que pinta ProductInfo y el precio tachado
 * sigue siendo coherente (ver ProductInfo.svelte:savingsPct).
 */
export function applyCommission(product: Product, pricing: VendorPricing): Product {
	const percent = commissionFor(product.id, pricing);
	if (!percent) return product;

	return {
		...product,
		price: priceWithCommission(product.price, percent),
		wholesalePrice:
			product.wholesalePrice === undefined
				? undefined
				: priceWithCommission(product.wholesalePrice, percent)
	};
}

export function priceCatalog(products: Product[], pricing: VendorPricing): Product[] {
	return products.filter((p) => !isHidden(p.id, pricing)).map((p) => applyCommission(p, pricing));
}
