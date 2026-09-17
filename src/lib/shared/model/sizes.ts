// Orden canónico de tallas de letra. WooCommerce las devuelve en el orden en
// que la clienta las creó en el panel (y con la caja que se le haya ocurrido),
// así que tanto la ficha de producto como el filtro las normalizan aquí en vez
// de cada una por su cuenta.
const LETTER_ORDER: Record<string, number> = {
	XXS: 0,
	XS: 1,
	S: 2,
	M: 3,
	L: 4,
	XL: 5,
	XXL: 6,
	XXXL: 7,
	'S/M': 8,
	'L/XL': 9,
	ÚNICO: 99,
	UNICO: 99,
	'TALLA ÚNICA': 99
};

/** Etiqueta que se muestra: siempre en mayúsculas, sin espacios sobrantes. */
export function formatSize(size: string): string {
	return size.trim().toUpperCase();
}

function isNumeric(size: string): boolean {
	const n = parseFloat(size);
	return !isNaN(n) && String(n) === size.trim();
}

/** Letras primero (XXS → XXXL), luego numéricas de menor a mayor. */
export function sortSizes(sizes: string[]): string[] {
	return [...sizes].sort((a, b) => {
		const aNum = isNumeric(a);
		const bNum = isNumeric(b);
		if (aNum && bNum) return parseFloat(a) - parseFloat(b);
		if (aNum !== bNum) return aNum ? 1 : -1;
		return (LETTER_ORDER[formatSize(a)] ?? 50) - (LETTER_ORDER[formatSize(b)] ?? 50);
	});
}
