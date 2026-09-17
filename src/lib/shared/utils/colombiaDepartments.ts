// Códigos ISO 3166-2 con el prefijo del país, que es EXACTAMENTE lo que espera
// WooCommerce: `CO-ATL`, no `ATL`. Verificado contra la lista que devuelve la
// propia tienda en /wp-json/wc/v3/data/countries/CO.
//
// Antes se enviaban sin prefijo. La API los aceptaba y los guardaba tal cual,
// así que desde fuera parecía correcto, pero el admin no podía emparejarlos con
// ningún departamento conocido y el pedido mostraba "Elige una opción" vacío:
// la clienta no sabía a qué departamento despachar.
export const COLOMBIA_DEPARTMENTS: { code: string; name: string }[] = [
	{ code: 'CO-AMA', name: 'Amazonas' },
	{ code: 'CO-ANT', name: 'Antioquia' },
	{ code: 'CO-ARA', name: 'Arauca' },
	{ code: 'CO-ATL', name: 'Atlántico' },
	{ code: 'CO-BOL', name: 'Bolívar' },
	{ code: 'CO-BOY', name: 'Boyacá' },
	{ code: 'CO-CAL', name: 'Caldas' },
	{ code: 'CO-CAQ', name: 'Caquetá' },
	{ code: 'CO-CAS', name: 'Casanare' },
	{ code: 'CO-CAU', name: 'Cauca' },
	{ code: 'CO-CES', name: 'Cesar' },
	{ code: 'CO-CHO', name: 'Chocó' },
	{ code: 'CO-COR', name: 'Córdoba' },
	{ code: 'CO-CUN', name: 'Cundinamarca' },
	{ code: 'CO-DC', name: 'Bogotá D.C.' },
	{ code: 'CO-GUA', name: 'Guainía' },
	{ code: 'CO-GUV', name: 'Guaviare' },
	{ code: 'CO-HUI', name: 'Huila' },
	{ code: 'CO-LAG', name: 'La Guajira' },
	{ code: 'CO-MAG', name: 'Magdalena' },
	{ code: 'CO-MET', name: 'Meta' },
	{ code: 'CO-NAR', name: 'Nariño' },
	{ code: 'CO-NSA', name: 'Norte de Santander' },
	{ code: 'CO-PUT', name: 'Putumayo' },
	{ code: 'CO-QUI', name: 'Quindío' },
	{ code: 'CO-RIS', name: 'Risaralda' },
	{ code: 'CO-SAP', name: 'San Andrés y Providencia' },
	{ code: 'CO-SAN', name: 'Santander' },
	{ code: 'CO-SUC', name: 'Sucre' },
	{ code: 'CO-TOL', name: 'Tolima' },
	{ code: 'CO-VAC', name: 'Valle del Cauca' },
	{ code: 'CO-VAU', name: 'Vaupés' },
	{ code: 'CO-VID', name: 'Vichada' }
];
