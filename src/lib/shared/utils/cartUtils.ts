import type { Product } from '$lib/shared/model/products';

export function calculateWholesaleDiscount(quantity: number, basePrice: number) {
	let discountPercentage = 0;

	if (quantity >= 100) discountPercentage = 15;
	else if (quantity >= 50) discountPercentage = 10;
	else if (quantity >= 20) discountPercentage = 5;

	const discountAmount = basePrice * (discountPercentage / 100);
	const finalPrice = basePrice - discountAmount;

	return {
		originalPrice: basePrice,
		finalPrice,
		discountPercentage,
		discountAmount,
		savings: discountAmount
	};
}

export function validateMinimumOrder(product: Product, quantity: number) {
	const minQty = product.minOrderQuantity;

	return {
		isValid: quantity >= minQty,
		minRequired: minQty,
		currentQuantity: quantity,
		message: quantity < minQty ? `Cantidad mínima requerida: ${minQty} piezas` : 'Cantidad válida'
	};
}

export const genderColors = {
	men: {
		primary: '#1e40af',
		secondary: '#3b82f6',
		accent: '#1e3a8a',
		background: '#eff6ff',
		text: '#1e3a8a'
	},
	women: {
		primary: '#be185d',
		secondary: '#ec4899',
		accent: '#9d174d',
		background: '#fdf2f8',
		text: '#9d174d'
	}
} as const;
