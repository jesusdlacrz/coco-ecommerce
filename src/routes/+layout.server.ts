import { env } from '$env/dynamic/private';

/**
 * Origen desde el que se sirven todas las fotos de producto (el WordPress).
 *
 * Se publica al cliente para poder abrir la conexión TLS por adelantado: en
 * 4G, establecerla cuesta varios cientos de milisegundos, y hasta ahora ese
 * coste se pagaba justo cuando el navegador iba a pedir la imagen principal.
 * No expone nada: esas URLs ya salen en el HTML de cada producto.
 */
function imageOrigin(): string | null {
	try {
		return new URL(env.WOO_API_URL ?? '').origin;
	} catch {
		return null;
	}
}

export function load() {
	return { imageOrigin: imageOrigin() };
}
