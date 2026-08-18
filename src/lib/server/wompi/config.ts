import { env } from '$env/dynamic/private';

export interface WompiConfig {
	publicKey: string;
	privateKey: string;
	integritySecret: string;
	eventsSecret: string;
	isSandbox: boolean;
}

// Mismo patrón que getConfig() en woocommerce.server.ts: null si falta
// cualquier variable, para poder distinguir "no configurado" de un error real.
export function getWompiConfig(): WompiConfig | null {
	const { WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY, WOMPI_INTEGRITY_SECRET, WOMPI_EVENTS_SECRET } = env;
	if (!WOMPI_PUBLIC_KEY || !WOMPI_PRIVATE_KEY || !WOMPI_INTEGRITY_SECRET || !WOMPI_EVENTS_SECRET) {
		return null;
	}
	return {
		publicKey: WOMPI_PUBLIC_KEY,
		privateKey: WOMPI_PRIVATE_KEY,
		integritySecret: WOMPI_INTEGRITY_SECRET,
		eventsSecret: WOMPI_EVENTS_SECRET,
		isSandbox: WOMPI_PUBLIC_KEY.startsWith('pub_test_')
	};
}
