import { writable } from 'svelte/store';
import { categoryStyles, type CategoryKey } from '$lib/products/filters/categoryStyles';

export type Category = CategoryKey;

export const activeCategory = writable<Category>('women');

export interface CategoryColors {
	primary: string;
	primaryHover: string;
	border: string;
	text: string;
}

// Vista reducida de `categoryStyles` para los consumidores que solo necesitan
// fondo/borde/texto (header, tarjeta de producto, pestañas del catálogo). No
// redefine ningún color: los toma de la fuente única.
export const categoryColors: Record<Category, CategoryColors> = {
	women: {
		primary: 'bg-[#7C00F4]',
		primaryHover: categoryStyles.women.solidHover,
		border: categoryStyles.women.borderColor,
		text: categoryStyles.women.textAccent
	},
	men: {
		primary: 'bg-[#16167F]',
		primaryHover: categoryStyles.men.solidHover,
		border: categoryStyles.men.borderColor,
		text: categoryStyles.men.textAccent
	},
	girls: {
		primary: 'bg-[#FF91C1]',
		primaryHover: categoryStyles.girls.solidHover,
		border: categoryStyles.girls.borderColor,
		text: categoryStyles.girls.textAccent
	},
	boys: {
		primary: 'bg-[#2C71CC]',
		primaryHover: categoryStyles.boys.solidHover,
		border: categoryStyles.boys.borderColor,
		text: categoryStyles.boys.textAccent
	}
};
