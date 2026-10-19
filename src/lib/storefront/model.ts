/**
 * Dominio público de la tienda, solo para TEXTOS visibles (ej. el prefijo
 * "cocosbodega.com/v/" del formulario de vendedores). Los enlaces reales usan
 * la URL desde la que se abrió la página, así que funcionan en cualquier dominio.
 */
export const SITE_DOMAIN = 'cocosbodega.com';

export interface Storefront {
	kind: 'house' | 'vendor';
	slug: string | null;
	basePath: string; // '' | '/v/andrea'  ← prefijo de TODOS los links
	name: string; // "Coco's" | "Boutique Andrea"
	whatsapp: string | null;
	bio: string | null;
	coverImageUrl: string | null;
	cartKey: string; // 'cart' | 'cart:v:andrea'
}

export const HOUSE_STORE: Storefront = {
	kind: 'house',
	slug: null,
	basePath: '',
	name: "Coco's",
	whatsapp: null,
	bio: null,
	coverImageUrl: null,
	cartKey: 'cart'
};
