import type { Product } from '$lib/shared/model/products';

// El flete se paga al recibir (transportadora nacional), así que no se cobra
// nada por envío en la pasarela: 0 aquí, 0 en el recálculo server-side del
// checkout y 0 en el pedido de WooCommerce, para que los tres coincidan.
// Si algún día se cobra el envío por adelantado, basta cambiar este valor.
export const SHIPPING_COST = 0;

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
	// Un precio mayorista igual (o mayor) al regular no es un descuento real —
	// mostrarlo tachado igual produce el "AHORRAS 0%" sin sentido.
	return product.wholesalePrice && product.wholesalePrice < product.price ? product.price : null;
}

export function savingsPercent(finalPrice: number, originalPrice: number): number {
	return Math.round((1 - finalPrice / originalPrice) * 100);
}
