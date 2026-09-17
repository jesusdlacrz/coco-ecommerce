import { navigating } from '$app/state';

/** Qué esqueleto corresponde al destino de una navegación en curso. */
export type PendingKind = 'catalog' | 'product' | null;

// Por debajo de este umbral no se muestra nada: una navegación que tarda 80ms y
// enseña un esqueleto produce un parpadeo que se percibe como un fallo, no como
// una carga. Solo aparece cuando la espera ya es perceptible de todas formas.
const DELAY_MS = 220;

function kindFor(pathname: string): PendingKind {
	// /productos y /v/<tienda>/productos
	if (/^(\/v\/[^/]+)?\/productos\/?$/.test(pathname)) return 'catalog';
	if (/^(\/v\/[^/]+)?\/productos\/[^/]+\/?$/.test(pathname)) return 'product';
	return null;
}

/**
 * Tipo de esqueleto a mostrar ahora mismo, o `null`.
 *
 * SvelteKit mantiene la página anterior en pantalla mientras busca los datos de
 * la siguiente, así que durante ese rato —el que tarda WooCommerce en responder—
 * el usuario no recibe ninguna señal de que algo está pasando. Esto cubre ese
 * hueco sin tocar el `load`: el HTML que sirve el servidor sigue llegando con
 * los productos dentro, que es lo que necesitan los buscadores.
 */
export function createPendingSkeleton() {
	let visible = $state<PendingKind>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const to = navigating.to?.url.pathname;
		clearTimeout(timer);

		if (!to) {
			visible = null;
			return;
		}

		const kind = kindFor(to);
		if (!kind) {
			visible = null;
			return;
		}

		timer = setTimeout(() => (visible = kind), DELAY_MS);
		return () => clearTimeout(timer);
	});

	return {
		get kind() {
			return visible;
		}
	};
}
