export interface DynamicPricePreset {
	id: string;
	label: string;
	min: number;
	max: number;
	/** El primer tramo incluye su límite inferior; los siguientes no, para que
	 *  una prenda justo en la frontera caiga en un único tramo. */
	includeMin: boolean;
	includeMax: boolean;
}

function label(kind: 'first' | 'middle' | 'last', min: number, max: number, fmt: (n: number) => string) {
	if (kind === 'first') return `Hasta ${fmt(max)}`;
	if (kind === 'last') return `Más de ${fmt(min)}`;
	return `${fmt(min)} – ${fmt(max)}`;
}

/**
 * Tramos de precio a partir de los precios reales del catálogo.
 *
 * Devuelve una lista vacía cuando no hay nada que elegir —un solo precio, o
 * ninguno—. Antes generaba en ese caso un tramo «$44.500 a $44.500» que
 * mostraba el total de prendas y, al pulsarlo, no descartaba ninguna: un
 * control que aparentaba filtrar sin filtrar.
 */
export function generateDynamicPricePresets(
	prices: number[],
	format: (n: number) => string
): DynamicPricePreset[] {
	const sorted = [...prices].sort((a, b) => a - b);
	const min = sorted[0];
	const max = sorted[sorted.length - 1];
	if (sorted.length === 0 || min === max) return [];

	if (sorted.length === 2) {
		const [p1] = sorted;
		return [
			{ id: `r1_${p1}`, label: label('first', min, p1, format), min, max: p1, includeMin: true, includeMax: true },
			{ id: `r2_${max}`, label: label('last', p1, max, format), min: p1, max, includeMin: false, includeMax: true }
		];
	}

	// Tres o más prendas: terciles, para que los tramos repartan el catálogo en
	// vez de partir el rango en tres trozos iguales que pueden quedar vacíos.
	const n = sorted.length;
	const b1 = sorted[Math.floor((n - 1) / 3)];
	const b2 = sorted[Math.floor(((n - 1) * 2) / 3)];

	if (b1 === b2) {
		// Muchas prendas al mismo precio: los dos cortes coinciden y sobra uno.
		return [
			{ id: `r1_${b1}`, label: label('first', min, b1, format), min, max: b1, includeMin: true, includeMax: true },
			{ id: `r2_${max}`, label: label('last', b1, max, format), min: b1, max, includeMin: false, includeMax: true }
		];
	}

	return [
		{ id: `r1_${b1}`, label: label('first', min, b1, format), min, max: b1, includeMin: true, includeMax: true },
		{ id: `r2_${b2}`, label: label('middle', b1, b2, format), min: b1, max: b2, includeMin: false, includeMax: true },
		{ id: `r3_${max}`, label: label('last', b2, max, format), min: b2, max, includeMin: false, includeMax: true }
	];
}

export function priceInPreset(price: number, preset: DynamicPricePreset): boolean {
	const lowerOk = preset.includeMin ? price >= preset.min : price > preset.min;
	const upperOk = preset.includeMax ? price <= preset.max : price < preset.max;
	return lowerOk && upperOk;
}
