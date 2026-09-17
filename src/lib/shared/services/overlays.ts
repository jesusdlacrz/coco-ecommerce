import { browser } from '$app/environment';

// Registro central de capas a pantalla completa (carrito, visor de imágenes,
// hoja de filtros).
//
// Antes cada capa gestionaba su propio bloqueo de scroll y su propio desmontaje
// sin saber de las demás, y no existía ningún punto del código capaz de
// responder "¿hay algo abierto ahora mismo?". Bastaba con que UNA se quedara
// pegada —un fondo `fixed inset-0` que no se desmonta, un `overflow: hidden`
// que no se restaura— para que la página quedara viva pero intocable, sin que
// nada lo detectara. Con un registro hay una única verdad, y el guardián de
// abajo puede repararla.

const open = new Set<string>();
let savedOverflow: string | null = null;

function sync() {
	if (!browser) return;
	if (open.size > 0) {
		if (savedOverflow === null) {
			savedOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		}
		return;
	}
	if (savedOverflow !== null) {
		document.body.style.overflow = savedOverflow;
		savedOverflow = null;
	}
}

/**
 * Declara una capa abierta y devuelve su función de cierre. El bloqueo de
 * scroll se deriva del registro: solo se suelta cuando no queda ninguna.
 */
export function registerOverlay(id: string): () => void {
	open.add(id);
	sync();
	let released = false;
	return () => {
		if (released) return; // idempotente: llamarla dos veces no descuadra el registro
		released = true;
		open.delete(id);
		sync();
	};
}

export function openOverlayCount(): number {
	return open.size;
}

/** Vuelve a un estado usable sin recargar, pase lo que pase. */
export function releaseAllOverlays(): void {
	open.clear();
	savedOverflow = null;
	if (!browser) return;
	document.body.style.overflow = '';
	document.documentElement.style.overflow = '';
}

function coversViewport(el: HTMLElement): boolean {
	const s = getComputedStyle(el);
	if (s.position !== 'fixed' || s.pointerEvents === 'none') return false;
	if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
	const r = el.getBoundingClientRect();
	return r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.9;
}

/**
 * Sube desde el elemento que está bajo el puntero buscando el ancestro que
 * cubre la pantalla.
 *
 * Es necesario mirar hacia arriba y no solo al propio elemento: lo que hay
 * encima suele ser un hijo —una `<img>` a pantalla completa, por ejemplo— que
 * no está posicionada ella misma. La versión anterior comprobaba únicamente el
 * elemento tocado, así que una capa pegada cuyo contenido tapara el centro
 * pasaba desapercibida y el guardián no reparaba nada.
 */
function blockerAt(x: number, y: number): { blocker: HTMLElement; hit: HTMLElement } | null {
	const hit = document.elementFromPoint(x, y);
	if (!(hit instanceof HTMLElement)) return null;
	let el: HTMLElement | null = hit;
	for (let depth = 0; el && depth < 12; depth++) {
		if (coversViewport(el)) return { blocker: el, hit };
		el = el.parentElement;
	}
	return null;
}

/**
 * Apaga los clics de un elemento de verdad.
 *
 * No basta con marcar el contenedor: si un descendiente trae su propio
 * `pointer-events: auto` —la imagen del visor lo lleva— gana sobre el padre y
 * sigue interceptando todo. Por eso se marca también el elemento concreto que
 * está bajo el puntero, y con `!important` para ganarle a la clase de Tailwind.
 */
function disablePointerEvents(el: HTMLElement) {
	el.style.setProperty('pointer-events', 'none', 'important');
}

/**
 * Guardián. Cada segundo comprueba la invariante:
 *
 *   si no hay ninguna capa registrada, nada a pantalla completa puede estar
 *   interceptando los clics, ni el scroll puede estar bloqueado.
 *
 * Si la invariante se rompe, la repara: neutraliza al intruso con
 * `pointer-events: none` en vez de quitarlo del DOM (quitarlo descuadraría a
 * Svelte, que cree que sigue ahí) y suelta el scroll. La página vuelve a ser
 * usable sola y deja constancia en la consola de qué era el intruso.
 *
 * Corre también en producción a propósito: el fallo que arregla no era exclusivo
 * de desarrollo, y el coste es leer tres puntos de la pantalla por segundo.
 */
export function startOverlayGuardian(): () => void {
	if (!browser) return () => {};

	const timer = setInterval(() => {
		if (open.size > 0) return; // hay algo abierto: todo esto es legítimo

		const problems: string[] = [];

		if (document.body.style.overflow === 'hidden' || document.documentElement.style.overflow === 'hidden') {
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
			problems.push('scroll bloqueado sin ninguna capa abierta');
		}

		// Tres sondas en vez de recorrer el DOM entero: barato de sobra para
		// correr cada segundo en cualquier página.
		const probes: [number, number][] = [
			[innerWidth / 2, innerHeight / 2],
			[innerWidth / 2, innerHeight * 0.15],
			[innerWidth / 2, innerHeight * 0.85]
		];
		for (const [x, y] of probes) {
			const found = blockerAt(x, y);
			if (!found) continue;
			// Sin capas registradas, un modal en el DOM es un huérfano aunque
			// lleve role="dialog": justamente eso es lo que hay que soltar.
			disablePointerEvents(found.blocker);
			if (found.hit !== found.blocker) disablePointerEvents(found.hit);
			problems.push(
				`capa huérfana neutralizada: ${found.blocker.tagName}.${String(found.blocker.className).slice(0, 50)}`
			);
			break;
		}

		if (problems.length) console.warn('[overlays] ' + problems.join(' · '));
	}, 1000);

	return () => clearInterval(timer);
}
