import { createHash } from 'node:crypto';

// Fórmula documentada por Wompi para la firma de integridad del widget:
// evita que alguien manipule el monto/referencia desde el navegador antes
// de abrir el checkout, ya que el backend es quien la calcula.
export function buildIntegritySignature(
	reference: string,
	amountInCents: number,
	currency: string,
	integritySecret: string
): string {
	const toHash = `${reference}${amountInCents}${currency}${integritySecret}`;
	return createHash('sha256').update(toHash).digest('hex');
}

interface WompiEventPayload {
	data: Record<string, unknown>;
	signature: { properties: string[]; checksum: string };
	timestamp: number;
}

function getByPath(source: unknown, path: string): unknown {
	return path.split('.').reduce<unknown>((acc, key) => {
		if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
		return undefined;
	}, source);
}

// Verifica que el evento del webhook realmente venga de Wompi: concatena los
// valores de las propiedades que Wompi indica (en el orden que manda), más el
// timestamp del evento, más nuestro secreto de eventos — nunca confiamos en
// el checksum sin recalcularlo nosotros mismos.
export function verifyEventChecksum(event: WompiEventPayload, eventsSecret: string): boolean {
	const concatenatedValues = event.signature.properties
		.map((path) => String(getByPath(event.data, path) ?? ''))
		.join('');
	const toHash = `${concatenatedValues}${event.timestamp}${eventsSecret}`;
	const checksum = createHash('sha256').update(toHash).digest('hex');
	return checksum.toUpperCase() === event.signature.checksum.toUpperCase();
}
