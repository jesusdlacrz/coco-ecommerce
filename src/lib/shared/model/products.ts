export interface Color {
	name: string;
	hex: string;
}

// Una combinación real de talla+color con su propio stock — viene de una
// variación de WooCommerce (producto variable). `size`/`color` son `null`
// cuando ese atributo no aplica (ej. solo se varía por color, no por talla).
export interface ProductVariation {
	id: number;
	size: string | null;
	color: string | null;
	stock: number;
	inStock: boolean;
}

export interface Product {
	id: string;
	name: string;
	price: number;
	wholesalePrice?: number;
	images: string[];
	/** `srcset` de WordPress para cada imagen, mismo índice que `images`.
	 *  WordPress ya genera los tamaños reducidos y los publica en la API;
	 *  sin esto el móvil descarga el original (1202×1600 para pintar 445px).
	 *  Campo aparte y no un objeto dentro de `images` para no tocar el carrito
	 *  guardado en el navegador, que almacena la URL suelta. */
	imageSrcsets?: string[];
	category: string;
	gender: 'men' | 'women' | 'boys' | 'girls';
	sizes: string[];
	colors: Color[];
	sku: string;
	minOrderQuantity: number;
	description: string;
	inStock: boolean;
	stockQuantity: number;
	// Ausente/vacío para los productos de ejemplo (fallback sin WooCommerce) o
	// para un producto simple que todavía no se convirtió a variable — en ese
	// caso el stock disponible es `stockQuantity` a nivel de producto completo.
	variations?: ProductVariation[];
}

export interface CartItem {
	id: string;
	productId: string;
	name: string;
	price: number;
	originalPrice?: number;
	image: string;
	category: string;
	gender: 'men' | 'women' | 'boys' | 'girls';
	size: string | null;
	color: string | null;
	quantity: number;
	sku: string;
	minOrderQuantity: number;
	discountApplied?: number;
	vendorSlug: string | null; // null = precio de la casa, sin comisión
	addedAt: string;
	updatedAt: string;
}

export interface CartSummary {
	totalItems: number;
	totalQuantity: number;
	subtotal: number;
	totalDiscount: number;
	finalTotal: number;
	byGender: {
		men: { items: number; quantity: number; total: number };
		women: { items: number; quantity: number; total: number };
		boys: { items: number; quantity: number; total: number };
		girls: { items: number; quantity: number; total: number };
	};
	byCategory: Record<string, { items: number; quantity: number; total: number }>;
}
