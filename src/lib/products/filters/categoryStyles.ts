// Category style configuration extracted from ProductFilters.svelte
export type CategoryKey = 'men' | 'women' | 'boys' | 'girls';

interface CategoryStyle {
  accent: string;
  accentHover: string;
  textAccent: string;
  textSecondary: string;
  rangeAccent: string;
  ringColor: string;
  borderColor: string;
  hoverBorderColor: string;
}

export const categoryStyles: Record<CategoryKey, CategoryStyle> = {
  men: {
    accent: 'bg-[#16167F] border-[#16167F] text-white',
    accentHover: 'hover:bg-[#414190] border-[#414190] hover:text-white',
    textAccent: 'text-[#16167F]',
    textSecondary: 'text-[#8A8A8A] hover:text-[#414190]',
    rangeAccent: 'accent-[#16167F]',
    ringColor: 'ring-[#16167F]',
    borderColor: 'border-[#16167F]',
    hoverBorderColor: 'hover:border-[#0F0F5F]'
  },
  women: {
    accent: 'bg-[#5A00B8] border-[#5A00B8] text-white',
    accentHover: 'hover:bg-[#7C00F4] border-[#7C00F4] hover:text-white',
    textAccent: 'text-[#5A00B8]',
    textSecondary: 'text-[#8A8A8A] hover:text-[#7C00F4]',
    rangeAccent: 'accent-[#7C00F4]',
    ringColor: 'ring-[#7C00F4]',
    borderColor: 'border-[#7C00F4]',
    hoverBorderColor: 'hover:border-[#5A00B8]'
  },
  boys: {
    accent: 'bg-[#2C71CC] border-[#2C71CC] text-white',
    accentHover: 'hover:bg-[#6297DB] border-[#6297DB] hover:text-white',
    textAccent: 'text-[#2C71CC]',
    textSecondary: 'text-[#8A8A8A] hover:text-[#6297DB]',
    rangeAccent: 'accent-[#2C71CC]',
    ringColor: 'ring-[#6297DB]',
    borderColor: 'border-[#6297DB]',
    hoverBorderColor: 'hover:border-[#4A7BC1]'
  },
  girls: {
    accent: 'bg-[#FF91C1] border-[#FF91C1] text-white',
    accentHover: 'hover:bg-[#faa1c8] border-[#faa1c8] hover:text-white',
    textAccent: 'text-[#FF91C1]',
    textSecondary: 'text-[#8A8A8A] hover:text-[#faa1c8]',
    rangeAccent: 'accent-[#FF91C1]',
    ringColor: 'ring-[#FF91C1]',
    borderColor: 'border-[#FF91C1]',
    hoverBorderColor: 'hover:border-[#E5729A]'
  }
};

export function getCategoryStyle(category: CategoryKey): CategoryStyle {
  return categoryStyles[category];
}
