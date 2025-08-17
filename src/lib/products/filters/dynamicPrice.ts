import type { PriceRange } from './filterUtils';

export interface DynamicPricePreset {
  id: string;
  label: string;
  min: number;
  max: number;
  includeMin: boolean; // true for first range, false for middle/last when exclusive lower bound
  includeMax: boolean; // kept for completeness (always true here)
}

function formatLabel(type: 'first' | 'middle' | 'last', min: number, max: number, fmt: (n:number)=>string) {
  if (type === 'first') return `Hasta ${fmt(max)}`;
  if (type === 'last') return `Más de ${fmt(min)}`;
  return `${fmt(min)} a ${fmt(max)}`;
}

export function generateDynamicPricePresets(prices: number[], format: (n:number)=>string): DynamicPricePreset[] {
  if (prices.length === 0) return [];
  const sorted = [...prices].sort((a,b)=>a-b);
  const min = sorted[0];
  const max = sorted[sorted.length-1];
  if (min === max) {
    return [{
      id: `single_${min}`,
      label: formatLabel('middle', min, max, format),
      min, max, includeMin: true, includeMax: true
    }];
  }
  if (sorted.length === 2) {
    const [p1,p2] = sorted;
    if (p1 === p2) {
      return [{ id:`single_${p1}`, label: formatLabel('middle', p1, p2, format), min:p1, max:p2, includeMin:true, includeMax:true }];
    }
    return [
      { id:`r1_${p1}`, label: formatLabel('first', min, p1, format), min, max: p1, includeMin:true, includeMax:true },
      { id:`r2_${p2}`, label: formatLabel('last', p1, max, format), min: p1, max, includeMin:false, includeMax:true }
    ];
  }
  // 3+ products -> terciles
  const n = sorted.length;
  const q1Index = Math.floor((n - 1) / 3);
  const q2Index = Math.floor(((n - 1) * 2) / 3);
  const b1 = sorted[q1Index];
  const b2 = sorted[q2Index];
  // handle collapse when boundaries equal
  if (b1 === b2) {
    // fallback to two ranges
    return [
      { id:`r1_${b1}`, label: formatLabel('first', min, b1, format), min, max: b1, includeMin:true, includeMax:true },
      { id:`r2_${b2}`, label: formatLabel('last', b2, max, format), min: b2, max, includeMin:false, includeMax:true }
    ];
  }
  return [
    { id:`r1_${b1}`, label: formatLabel('first', min, b1, format), min, max: b1, includeMin:true, includeMax:true },
    { id:`r2_${b2}`, label: formatLabel('middle', b1, b2, format), min: b1, max: b2, includeMin:false, includeMax:true },
    { id:`r3_${b2}`, label: formatLabel('last', b2, max, format), min: b2, max, includeMin:false, includeMax:true }
  ];
}

export function priceInPreset(p: number, preset: DynamicPricePreset) {
  const lowerOk = preset.includeMin ? p >= preset.min : p > preset.min;
  const upperOk = preset.includeMax ? p <= preset.max : p < preset.max;
  return lowerOk && upperOk;
}

export function applyDynamicPreset(preset: DynamicPricePreset): PriceRange {
  return { min: preset.min, max: preset.max };
}
