import type { PriceRange } from './filterUtils';

export interface PricePresetDef {
  id: 'under200' | '200to300' | 'over300';
  label: string;
  apply: (bounds: { minPrice: number; maxPrice: number }) => PriceRange;
}

export const PRICE_PRESETS: readonly PricePresetDef[] = [
  {
    id: 'under200',
    label: 'Hasta $ 200.000',
    apply: ({ minPrice }) => ({ min: minPrice, max: 200000 })
  },
  {
    id: '200to300',
    label: '$200.000 a $300.000',
    apply: () => ({ min: 200000, max: 300000 })
  },
  {
    id: 'over300',
    label: 'Más de $300.000',
    apply: ({ maxPrice }) => ({ min: 300000, max: maxPrice })
  }
] as const;

export function findPresetLabel(id: string | null): string | null {
  if (!id) return null;
  const p = PRICE_PRESETS.find(pr => pr.id === id);
  return p ? p.label : null;
}
