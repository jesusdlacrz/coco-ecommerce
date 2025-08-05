import { writable } from 'svelte/store';

export type Category = 'men' | 'women' | 'boys' | 'girls';

export const activeCategory = writable<Category>('men');

export const categoryColors = {
	men: {
		primary: 'bg-blue-600',
		primaryHover: 'hover:bg-blue-700',
		light: 'bg-blue-50',
		border: 'border-blue-600',
		text: 'text-blue-600'
	},
	women: {
		primary: 'bg-pink-600',
		primaryHover: 'hover:bg-pink-700',
		light: 'bg-pink-50',
		border: 'border-pink-600',
		text: 'text-pink-600'
	},
	boys: {
		primary: 'bg-green-600',
		primaryHover: 'hover:bg-green-700',
		light: 'bg-green-50',
		border: 'border-green-600',
		text: 'text-green-600'
	},
	girls: {
		primary: 'bg-purple-600',
		primaryHover: 'hover:bg-purple-700',
		light: 'bg-purple-50',
		border: 'border-purple-600',
		text: 'text-purple-600'
	}
};
