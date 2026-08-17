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
