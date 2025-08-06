import { writable } from 'svelte/store';

export type Category = 'men' | 'women' | 'boys' | 'girls';

export const activeCategory = writable<Category>('men');

export const categoryColors = {
	men: {
		primary: 'bg-[#16167F]',
		primaryHover: 'hover:bg-[#16167F90]',
		border: 'border-[#16167F]',
		text: 'text-[#16167F]'
	},
	women: {
		primary: 'bg-[#7C00F4]',
		primaryHover: 'hover:bg-[#7C00F490]',
		border: 'border-[#7C00F4]',
		text: 'text-[#7C00F4]'
	},
	boys: {
		primary: 'bg-[#6296DB]',
		primaryHover: 'hover:bg-[#6296DB90]',
		border: 'border-[#6296DB]',
		text: 'text-[#6296DB]'
	},
	girls: {
		primary: 'bg-[#FF91C0]',
		primaryHover: 'hover:bg-[#FF91C090]',
		border: 'border-[#FF91C0]',
		text: 'text-[#FF91C0]'
	}
};
