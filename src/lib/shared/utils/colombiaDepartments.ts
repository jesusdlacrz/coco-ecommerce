// Mismos códigos que usa WooCommerce internamente para los departamentos de
// Colombia (state_code de WC_Countries) — hay que mandar el código, no el
// nombre, para que el pedido llegue con el departamento ya seleccionado en
// vez de "Elige una opción..." vacío en el admin.
export const COLOMBIA_DEPARTMENTS: { code: string; name: string }[] = [
	{ code: 'AMA', name: 'Amazonas' },
	{ code: 'ANT', name: 'Antioquia' },
	{ code: 'ARA', name: 'Arauca' },
	{ code: 'ATL', name: 'Atlántico' },
	{ code: 'BOL', name: 'Bolívar' },
	{ code: 'BOY', name: 'Boyacá' },
	{ code: 'CAL', name: 'Caldas' },
	{ code: 'CAQ', name: 'Caquetá' },
	{ code: 'CAS', name: 'Casanare' },
	{ code: 'CAU', name: 'Cauca' },
	{ code: 'CES', name: 'Cesar' },
	{ code: 'CHO', name: 'Chocó' },
	{ code: 'COR', name: 'Córdoba' },
	{ code: 'CUN', name: 'Cundinamarca' },
	{ code: 'DC', name: 'Bogotá D.C.' },
	{ code: 'GUA', name: 'Guainía' },
	{ code: 'GUV', name: 'Guaviare' },
	{ code: 'HUI', name: 'Huila' },
	{ code: 'LAG', name: 'La Guajira' },
	{ code: 'MAG', name: 'Magdalena' },
	{ code: 'MET', name: 'Meta' },
	{ code: 'NAR', name: 'Nariño' },
	{ code: 'NSA', name: 'Norte de Santander' },
	{ code: 'PUT', name: 'Putumayo' },
	{ code: 'QUI', name: 'Quindío' },
	{ code: 'RIS', name: 'Risaralda' },
	{ code: 'SAP', name: 'San Andrés y Providencia' },
	{ code: 'SAN', name: 'Santander' },
	{ code: 'SUC', name: 'Sucre' },
	{ code: 'TOL', name: 'Tolima' },
	{ code: 'VAC', name: 'Valle del Cauca' },
	{ code: 'VAU', name: 'Vaupés' },
	{ code: 'VID', name: 'Vichada' }
];
