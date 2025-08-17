import type { Product } from '$lib/shared/model/products';
import type { PriceRange } from './filterUtils';

export interface FilterState {
  selectedCategories: string[];
  selectedSizes: string[];
  selectedColors: string[];
  priceRange: PriceRange;
  pricePreset: string | null;
}

export function applyNonPriceFilters(products: Product[], state: FilterState) {
  return products.filter(p => {
    const categoryMatch = state.selectedCategories.length === 0 || state.selectedCategories.includes(p.category);
    const sizeMatch = state.selectedCategories.length === 0 || state.selectedSizes.length === 0 || p.sizes.some(s => state.selectedSizes.includes(s));
    const colorMatch = state.selectedColors.length === 0 || p.colors.some(c => state.selectedColors.includes(c.name));
    return categoryMatch && sizeMatch && colorMatch;
  });
}

export function countPricePresets(base: Product[]) {
  return {
    under200: base.filter(p => p.price <= 200000).length,
    between200and300: base.filter(p => p.price >= 200000 && p.price <= 300000).length,
    over300: base.filter(p => p.price >= 300000).length
  } as const;
}

export function productsExceptCategory(products: Product[], state: FilterState) {
  return products.filter(p => {
    const sizeMatch = state.selectedSizes.length === 0 || p.sizes.some(s => state.selectedSizes.includes(s));
    const colorMatch = state.selectedColors.length === 0 || p.colors.some(c => state.selectedColors.includes(c.name));
    const priceMatch = p.price >= state.priceRange.min && p.price <= state.priceRange.max;
    return sizeMatch && colorMatch && priceMatch; // deliberately ignore category selection
  });
}

export function buildCategoryCounts(allCategories: string[], filtered: Product[]) {
  return Object.fromEntries(
    allCategories.map(cat => [cat, filtered.filter(p => p.category === cat).length])
  ) as Record<string, number>;
}
