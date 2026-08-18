import type { Product } from '$lib/shared/model/products';

// Envío plano — mismo valor usado en el resumen del carrito y en el
// recálculo server-side del checkout, para que nunca queden desincronizados.
export const SHIPPING_COST = 60;

// Instancia única: crear un Intl.NumberFormat por llamada es costoso cuando se
// formatean decenas de precios por render (catálogo, filtros, carrito).
const COP = new Intl.NumberFormat('es-CO', {
	style: 'currency',
	currency: 'COP',
	minimumFractionDigits: 0
});

export function formatPrice(price: number): string {
	return COP.format(price);
}

// wholesalePrice = precio final con descuento (principal), price = precio original (tachado)
export function displayPrice(product: Pick<Product, 'price' | 'wholesalePrice'>): number {
	return product.wholesalePrice ?? product.price;
}

export function strikePrice(product: Pick<Product, 'price' | 'wholesalePrice'>): number | null {
	return product.wholesalePrice ? product.price : null;
}

export function savingsPercent(finalPrice: number, originalPrice: number): number {
	return Math.round((1 - finalPrice / originalPrice) * 100);
}
