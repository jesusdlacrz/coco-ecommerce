import type { Product } from '$lib/shared/model/products';
import { priceInPreset, type DynamicPricePreset } from './dynamicPrice';

export function getAllCategories(products: Product[]): string[] {
  return [...new Set(products.map(p => p.category))].sort();
}

export function getMinPrice(products: Product[]): number {
  return Math.min(...products.map(p => p.price));
}

export function getMaxPrice(products: Product[]): number {
  return Math.max(...products.map(p => p.price));
}

export function getFilteredByCategories(products: Product[], selectedCategories: string[]): Product[] {
  if (selectedCategories.length === 0) return [];
  return products.filter(p => selectedCategories.includes(p.category));
}

export function getAvailableSizes(products: Product[], selectedCategories: string[]): string[] {
  if (selectedCategories.length === 0) return [];
  const filtered = getFilteredByCategories(products, selectedCategories);
  return [...new Set(filtered.flatMap(p => p.sizes))].sort();
}

export function getFilteredByCategoriesAndSizes(products: Product[], selectedCategories: string[], selectedSizes: string[]): Product[] {
  let filtered = getFilteredByCategories(products, selectedCategories);
  if (selectedSizes.length > 0) {
    filtered = filtered.filter(product => product.sizes.some(size => selectedSizes.includes(size)));
  }
  return filtered;
}

export function getAvailableColors(products: Product[], selectedCategories: string[], selectedSizes: string[]): [string, string][] {
  // When there are no selected categories show all colors
  const filteredProducts = selectedCategories.length === 0
    ? products
    : getFilteredByCategoriesAndSizes(products, selectedCategories, selectedSizes);

  const colorMap = new Map<string, string>();
  filteredProducts.forEach(product => {
    product.colors.forEach(color => {
      if (!colorMap.has(color.name)) {
        colorMap.set(color.name, color.hex);
      }
    });
  });
  return Array.from(colorMap.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export interface FilterCriteria {
  selectedCategories: string[];
  selectedSizes: string[];
  selectedColors: string[];
  /** `null` = sin filtro de precio. */
  pricePreset: DynamicPricePreset | null;
}

export function applyAllFilters(products: Product[], criteria: FilterCriteria): Product[] {
  const { selectedCategories, selectedSizes, selectedColors, pricePreset } = criteria;
  return products.filter(product => {
    // Category filter
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    // Size filter (only if categories are selected)
    const sizeMatch = selectedCategories.length === 0 || selectedSizes.length === 0 || product.sizes.some(size => selectedSizes.includes(size));
    // Color filter
    const colorMatch = selectedColors.length === 0 || product.colors.some(color => selectedColors.includes(color.name));
    // Precio: se pregunta al propio tramo. Comparar contra min/max sueltos
    // metería en dos tramos a la prenda que cae justo en la frontera, y el
    // conteo dejaría de cuadrar con lo que muestra la rejilla.
    const priceMatch = pricePreset === null || priceInPreset(product.price, pricePreset);
    return categoryMatch && sizeMatch && colorMatch && priceMatch;
  });
}
