import type { Product, ProductVariation } from './products';

// Suma el stock de todas las variaciones que calzan con una talla (sin
// importar el color, o con un color concreto si ya se eligió uno).
export function stockForSize(variations: ProductVariation[], size: string, color: string | null): number {
	return variations
		.filter((v) => v.size === size && (color === null || v.color === color))
		.reduce((sum, v) => sum + (v.inStock ? v.stock : 0), 0);
}

// Igual que `stockForSize` pero agrupando por color.
export function stockForColor(variations: ProductVariation[], color: string, size: string | null): number {
	return variations
		.filter((v) => v.color === color && (size === null || v.size === size))
		.reduce((sum, v) => sum + (v.inStock ? v.stock : 0), 0);
}

// Stock de una combinación talla+color exacta (la que de verdad se compra).
export function stockForCombo(variations: ProductVariation[], size: string | null, color: string | null): number {
	return variations
		.filter((v) => v.size === size && v.color === color)
		.reduce((sum, v) => sum + (v.inStock ? v.stock : 0), 0);
}

// Stock disponible para una combinación talla+color concreta. Sin variaciones
// (producto simple, o uno que todavía no se convirtió a variable en
// WooCommerce) se cae al stock total del producto — es lo único que existe
// en ese caso.
export function getVariationStock(product: Product, size: string | null, color: string | null): number {
	const variations = product.variations ?? [];
	if (!variations.length) {
		return product.inStock ? product.stockQuantity : 0;
	}
	return stockForCombo(variations, size, color);
}
