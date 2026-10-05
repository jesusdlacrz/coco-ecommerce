export interface FAQ {
	question: string;
	answer: string;
	icon?: string; // Optional icon property
}
export const faqs: FAQ[] = [
	{
		question: '¿Cómo puedo realizar un pedido?',
		answer:
			'Navega por el catálogo, elige la talla y el color de cada prenda y agrégala al carrito. Cuando tengas tu pedido listo, completa tus datos de envío y paga en línea.'
	},
	{
		question: '¿Hay un pedido mínimo?',
		answer:
			'Sí. Al ser una bodega mayorista, el mínimo es de 4 unidades por prenda. Puedes combinar tallas y colores de una misma prenda para completarlas (por ejemplo, 2 en talla M y 2 en talla L).'
	},
	{
		question: '¿Cuáles son las opciones de pago disponibles?',
		answer:
			'Puedes pagar con tarjeta de crédito o débito, PSE o Nequi. Los pagos se procesan de forma segura a través de Wompi.'
	},
	{
		question: '¿Cuánto cuesta el envío?',
		answer:
			'Hacemos envíos a toda Colombia. El flete se paga al recibir el pedido, directamente a la transportadora, por lo que no se cobra en el pago en línea.'
	},
	{
		question: '¿Qué debo hacer si recibo un producto dañado o incorrecto?',
		answer:
			'Escríbenos desde la página de contacto apenas recibas tu pedido, con el número de pedido y fotos del producto, y te ayudamos a solucionarlo.'
	}
];
