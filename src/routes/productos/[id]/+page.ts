import type { PageLoad } from './$types';
import { sampleProducts } from '$lib/data/products';
import { error } from '@sveltejs/kit';

export const load: PageLoad = ({ params }) => {
	const product = sampleProducts.find(p => p.id === params.id);
	
	if (!product) {
		throw error(404, 'Producto no encontrado');
	}
	
	return {
		product
	};
};
