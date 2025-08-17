import { writable } from 'svelte/store';

export type Category = 'women' | 'men' | 'girls' | 'boys';

export const activeCategory = writable<Category>('women');

export const categoryColors = {
	women: {
		primary: 'bg-[#7C00F4]',
		primaryHover: 'hover:bg-[#7C00F490]',
		border: 'border-[#7C00F4]',
		text: 'text-[#7C00F4]'
	},
	men: {
		primary: 'bg-[#16167F]',
		primaryHover: 'hover:bg-[#16167F90]',
		border: 'border-[#16167F]',
		text: 'text-[#16167F]'
	},
	girls: {
		primary: 'bg-[#FF91C0]',
		primaryHover: 'hover:bg-[#FF91C090]',
		border: 'border-[#FF91C0]',
		text: 'text-[#FF91C0]'
	},
	boys: {
		primary: 'bg-[#6296DB]',
		primaryHover: 'hover:bg-[#6296DB90]',
		border: 'border-[#6296DB]',
		text: 'text-[#6296DB]'
	}
};
