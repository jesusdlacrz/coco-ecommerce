import type { CartItem } from '$lib/shared/model/products';

// Un ítem del carrito guarda el vendedor con el que se compró, así que el
// enlace tiene que volver a la ficha de ESA tienda: la revista del vendedor
// aplica su propia comisión sobre el precio.
export function productHrefForCartItem(item: Pick<CartItem, 'productId' | 'vendorSlug'>): string {
	const basePath = item.vendorSlug ? `/v/${item.vendorSlug}` : '';
	return `${basePath}/productos/${item.productId}`;
}
