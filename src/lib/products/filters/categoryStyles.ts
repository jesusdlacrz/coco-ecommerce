// Fuente única de los colores por categoría.
//
// Antes esto vivía repetido en cinco archivos (este, `categoryStore.ts`,
// `CategoryTabs.svelte`, `ProductDetailPage.svelte` y el layout de la tienda) y
// ya habían divergido: Mujeres era #7C00F4 en unos sitios y #5A00B8 en otros,
// Niñas #FF91C0 vs #FF91C1, Niños #6296DB vs #2C71CC, y la ficha de producto
// pintaba el fondo de Hombres con el azul de Niños. Un cambio de marca tenía
// que hacerse cinco veces y en la práctica nunca se hacía completo.
//
// Las clases van escritas como literales (y no compuestas en runtime) porque
// Tailwind escanea el código fuente: `bg-[${hex}]` no generaría nada.
export type CategoryKey = 'men' | 'women' | 'boys' | 'girls';

export interface CategoryStyle {
	accent: string;
	accentHover: string;
	textAccent: string;
	textSecondary: string;
	rangeAccent: string;
	ringColor: string;
	borderColor: string;
	hoverBorderColor: string;
	accentColor: string; // hex crudo para CSS inline (sliders, degradados)
	/** Fondo tenue de la categoría: catálogo y ficha de producto. */
	tint: string;
	/** Fondo de hover para una pestaña inactiva. */
	softHover: string;
}

export const categoryStyles: Record<CategoryKey, CategoryStyle> = {
	men: {
		accent: 'bg-[#16167F] border-[#16167F] text-white',
		accentHover: 'hover:bg-[#414190] border-[#414190] hover:text-white',
		textAccent: 'text-[#16167F]',
		textSecondary: 'text-muted-soft hover:text-[#414190]',
		rangeAccent: 'accent-[#16167F]',
		ringColor: 'ring-[#16167F]',
		borderColor: 'border-[#16167F]',
		hoverBorderColor: 'hover:border-[#0F0F5F]',
		accentColor: '#16167F',
		tint: 'bg-[#EFEFF9]',
		softHover: 'hover:bg-[#16167F14]'
	},
	women: {
		accent: 'bg-[#7C00F4] border-[#7C00F4] text-white',
		accentHover: 'hover:bg-[#5A00B8] border-[#5A00B8] hover:text-white',
		textAccent: 'text-[#5A00B8]',
		textSecondary: 'text-muted-soft hover:text-[#7C00F4]',
		rangeAccent: 'accent-[#7C00F4]',
		ringColor: 'ring-[#7C00F4]',
		borderColor: 'border-[#7C00F4]',
		hoverBorderColor: 'hover:border-[#5A00B8]',
		accentColor: '#7C00F4',
		tint: 'bg-[#F8F4FC]',
		softHover: 'hover:bg-[#7C00F414]'
	},
	boys: {
		accent: 'bg-[#2C71CC] border-[#2C71CC] text-white',
		accentHover: 'hover:bg-[#6297DB] border-[#6297DB] hover:text-white',
		textAccent: 'text-[#2C71CC]',
		textSecondary: 'text-muted-soft hover:text-[#6297DB]',
		rangeAccent: 'accent-[#2C71CC]',
		ringColor: 'ring-[#6297DB]',
		borderColor: 'border-[#6297DB]',
		hoverBorderColor: 'hover:border-[#4A7BC1]',
		accentColor: '#2C71CC',
		tint: 'bg-[#F0F4FC]',
		softHover: 'hover:bg-[#2C71CC14]'
	},
	girls: {
		accent: 'bg-[#FF91C1] border-[#FF91C1] text-white',
		accentHover: 'hover:bg-[#faa1c8] border-[#faa1c8] hover:text-white',
		textAccent: 'text-[#E5729A]',
		textSecondary: 'text-muted-soft hover:text-[#faa1c8]',
		rangeAccent: 'accent-[#FF91C1]',
		ringColor: 'ring-[#FF91C1]',
		borderColor: 'border-[#FF91C1]',
		hoverBorderColor: 'hover:border-[#E5729A]',
		accentColor: '#FF91C1',
		tint: 'bg-[#FFECF4]',
		softHover: 'hover:bg-[#FF91C129]'
	}
};

export function getCategoryStyle(category: CategoryKey): CategoryStyle {
	return categoryStyles[category];
}
