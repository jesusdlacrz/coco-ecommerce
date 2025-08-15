// Category style configuration extracted from ProductFilters.svelte
export type CategoryKey = 'men' | 'women' | 'boys' | 'girls';

interface CategoryStyle {
  accent: string;
  accentHover: string;
  textAccent: string;
  rangeAccent: string;
  ringColor: string;
  borderColor: string;
  hoverBorderColor: string;
}

export const categoryStyles: Record<CategoryKey, CategoryStyle> = {
  men: {
    accent: 'bg-[#2C71CC] border-[#2C71CC] text-white',
    accentHover: 'hover:bg-[#2C71CC] hover:border-[#2C71CC]',
    textAccent: 'text-[#16167F]',
    rangeAccent: 'accent-[#16167F]',
    ringColor: 'ring-[#16167F]',
    borderColor: 'border-[#16167F]',
    hoverBorderColor: 'hover:border-[#0F0F5F]'
  },
  women: {
    accent: 'bg-[#B19ADE] border-[#B19ADE] text-white',
    accentHover: 'hover:bg-[#B19ADE] hover:border-[#B19ADE]',
    textAccent: 'text-[#7C00F4] ',
    rangeAccent: 'accent-[#7C00F4]',
    ringColor: 'ring-[#7C00F4]',
    borderColor: 'border-[#7C00F4]',
    hoverBorderColor: 'hover:border-[#5A00B8]'
  },
  boys: {
    accent: 'bg-[#2C71CC] border-[#2C71CC] text-white',
    accentHover: 'hover:bg-[#2C71CC] hover:border-[#2C71CC]',
    textAccent: 'text-[#6297DB]',
    rangeAccent: 'accent-[#2C71CC]',
    ringColor: 'ring-[#6297DB]',
    borderColor: 'border-[#6297DB]',
    hoverBorderColor: 'hover:border-[#4A7BC1]'
  },
  girls: {
    accent: 'bg-[#FF91C1] border-[#FF91C1] text-white',
    accentHover: 'hover:bg-[#FF91C1] hover:border-[#FF91C1]',
    textAccent: 'text-[#FF91C1]',
    rangeAccent: 'accent-[#FF91C1]',
    ringColor: 'ring-[#FF91C1]',
    borderColor: 'border-[#FF91C1]',
    hoverBorderColor: 'hover:border-[#E5729A]'
  }
};

export function getCategoryStyle(category: CategoryKey): CategoryStyle {
  return categoryStyles[category];
}
