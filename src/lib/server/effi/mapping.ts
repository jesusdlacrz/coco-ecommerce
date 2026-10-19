// Diccionarios para traducir el catálogo de Effi al de la tienda. Effi no
// maneja tallas ni colores como datos: la clienta los codifica en la
// referencia (BASE-COLOR-TALLA, ej. JOG-NEG-32), así que aquí vive el
// significado de cada código. Es el único archivo que hay que tocar si
// aparece un código nuevo o alguno está mal traducido.

/**
 * Código de color en la referencia → nombre que se muestra en la tienda.
 * Los nombres coinciden con `HEX_BY_COLOR_NAME` de woocommerce.server.ts para
 * que el circulito salga del color correcto; el hex exacto se puede afinar
 * después desde WordPress (Productos → Atributos → Color → "Color real").
 *
 * Los marcados "por confirmar" se dedujeron del contexto y hay que validarlos
 * con la clienta. Un código que no esté aquí se muestra tal cual (ej. "XYZ").
 */
export const COLOR_BY_CODE: Record<string, string> = {
	NEG: 'Negro',
	BLA: 'Blanco',
	GRI: 'Gris',
	GRIO: 'Gris oscuro',
	BEI: 'Beige',
	CAF: 'Café',
	CAFC: 'Café claro',
	CAQ: 'Caqui',
	CAM: 'Camel',
	MARR: 'Marrón',
	TERR: 'Terracota',
	NUD: 'Nude',
	MOS: 'Mostaza',
	DOR: 'Dorado',
	AMA: 'Amarillo',
	NAR: 'Naranja',
	MAND: 'Mandarina',
	ROJ: 'Rojo',
	VIN: 'Vino',
	BOR: 'Borgoña',
	ROS: 'Rosado',
	FUC: 'Fucsia',
	FUCS: 'Fucsia',
	LIL: 'Lila',
	UVA: 'Uva',
	MOR: 'Morado',
	AZU: 'Azul',
	AZR: 'Azul rey',
	AZC: 'Azul claro', // por confirmar
	AZT: 'Azul turquesa', // por confirmar
	AZP: 'Azul petróleo', // por confirmar
	AZG: 'Azul grisáceo', // por confirmar
	VER: 'Verde',
	VERM: 'Verde militar', // por confirmar
	VERO: 'Verde oliva', // por confirmar
	VERMZ: 'Verde manzana', // por confirmar
	VAM: 'Verde agua marina', // por confirmar
	ACEI: 'Verde aceituna' // por confirmar
};

/**
 * Códigos de talla. Las numéricas (28, 30…) se reconocen solas; aquí van las
 * de letra y las especiales. `U` y `P` en la práctica nunca varían dentro de
 * una familia (el "PLUS" va en el nombre), pero se traducen por si aparecen.
 */
export const SIZE_BY_CODE: Record<string, string> = {
	XXS: 'XXS',
	XS: 'XS',
	S: 'S',
	M: 'M',
	L: 'L',
	XL: 'XL',
	XXL: 'XXL',
	XXXL: 'XXXL',
	U: 'Única',
	P: 'Plus'
};

export type GenderSlug = 'hombre' | 'mujer' | 'nino' | 'nina';

/** Categoría de Effi → género por defecto de sus artículos. */
export const GENDER_BY_EFFI_CATEGORY: Record<string, GenderSlug> = {
	'DENIN DAMA': 'mujer',
	'DENIN CABALLERO': 'hombre',
	CABALLERO: 'hombre',
	'GENERAL DAMA': 'mujer',
	BLUSAS: 'mujer',
	'SET DAMA': 'mujer',
	'VESTIDO ELEGANTE': 'mujer',
	'VESTIDO FORMAL': 'mujer',
	'VESTIDO ESTAMPADO': 'mujer',
	'VESTIDO HILO': 'mujer',
	'BODYS COCOS': 'mujer',
	'COCOS FABRICA': 'mujer',
	'MANTAS GUAJIRA': 'mujer',
	PIJAMA: 'mujer',
	'ROPA INTERIOR': 'mujer',
	'ROPA DEPORTIVA': 'mujer', // mezcla de dama y caballero: por confirmar
	'ROPA NIÑO': 'nino'
};

/** Si el nombre trae una de estas palabras, manda sobre la categoría. */
export const GENDER_BY_NAME_WORD: [RegExp, GenderSlug][] = [
	[/\bNIÑA\b/, 'nina'],
	[/\bNIÑO\b/, 'nino'],
	[/\bCABALLERO\b|\bHOMBRE\b/, 'hombre'],
	[/\bDAMA\b|\bMUJER\b/, 'mujer']
];

/**
 * Tipo de prenda (la etiqueta visible y la categoría de WooCommerce), por la
 * primera coincidencia en el nombre. El nombre es más fiable que la categoría
 * de Effi: hay mantas dentro de "DENIN DAMA" y bodys dentro de "COCOS FABRICA".
 */
export const TYPE_BY_NAME_WORD: [RegExp, string][] = [
	[/^JEANS?\b|\bJEAN\b/, 'Jeans'],
	[/^JOGGER/, 'Joggers'],
	[/^PANTALONETA|^SHORT|^SHOR\b|^BERMUDA/, 'Shorts'],
	[/^PANTAL[OÓ]N/, 'Pantalones'],
	[/^BODY/, 'Bodys'],
	[/^MANTA/, 'Mantas guajiras'],
	[/^BLUSA/, 'Blusas'],
	[/^CAMISETA/, 'Camisetas'],
	[/^CAMISA/, 'Camisas'],
	[/^VESTIDO/, 'Vestidos'],
	[/^ENTERIZO/, 'Enterizos'],
	[/^CONJ(UNTO)?\b|^SET\b/, 'Conjuntos'],
	[/^PIJAMA/, 'Pijamas'],
	[/^SU[EÉ]TER|^BUZO/, 'Sacos y buzos'],
	[/^FALDA/, 'Faldas'],
	[/^MEDIA|^PANTY|^TRIO|^BOXER|^BRASIER|^TOP\b/, 'Ropa interior'],
	[/^POLO|^TIPO POLO/, 'Polos']
];

/** Tipo de prenda si el nombre no dice nada: según la categoría de Effi. */
export const TYPE_BY_EFFI_CATEGORY: Record<string, string> = {
	'DENIN DAMA': 'Jeans',
	'DENIN CABALLERO': 'Jeans',
	BLUSAS: 'Blusas',
	'SET DAMA': 'Conjuntos',
	'VESTIDO ELEGANTE': 'Vestidos',
	'VESTIDO FORMAL': 'Vestidos',
	'VESTIDO ESTAMPADO': 'Vestidos',
	'VESTIDO HILO': 'Vestidos',
	'BODYS COCOS': 'Bodys',
	'COCOS FABRICA': 'Bodys',
	'MANTAS GUAJIRA': 'Mantas guajiras',
	PIJAMA: 'Pijamas',
	'ROPA INTERIOR': 'Ropa interior',
	'ROPA DEPORTIVA': 'Deportiva'
};

export const FALLBACK_TYPE = 'Otros';
