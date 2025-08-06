export interface FAQ {
	question: string;
	answer: string;
	icon?: string; // Optional icon property
}
export const faqs: FAQ[] = [
	{
		question: '¿Cómo puedo realizar un pedido?',
		answer:
			'Para realizar un pedido, simplemente navega por nuestro catálogo, selecciona los productos que deseas y agrégales al carrito. Luego, sigue el proceso de pago para completar tu compra.'
	},
	{
		question: '¿Cuáles son las opciones de pago disponibles?',
		answer:
			'Aceptamos tarjetas de crédito, débito y pagos a través de PayPal. También ofrecemos opciones de pago en efectivo contra entrega en algunas localidades.'
	},
	{
		question: '¿Cómo puedo rastrear mi pedido?',
		answer:
			'Una vez que tu pedido haya sido enviado, recibirás un correo electrónico con un enlace para rastrear tu envío en tiempo real.'
	},
	{
		question: '¿Qué debo hacer si recibo un producto dañado o incorrecto?',
		answer:
			'Si recibes un producto dañado o incorrecto, contáctanos dentro de las 48 horas posteriores a la entrega para gestionar un reemplazo o reembolso.'
	}
];
