import type { CartItem } from '$lib/shared/model/products';

/**
 * Stock real disponible por línea del carrito, consultado al servidor.
 *
 * Vive aquí y no dentro del panel del carrito porque el resumen del pedido
 * necesita exactamente el mismo dato para poder limitar la cantidad igual. Dos
 * copias de esta lógica serían dos sitios donde los topes pueden discrepar.
 *
 * Es solo la capa de experiencia de uso: `checkout/start` revalida en el
 * servidor antes de cobrar, así que un fallo aquí nunca deja pasar un pedido
 * imposible — simplemente no limita nada en pantalla.
 */
export function createStockLookup(
	items: () => CartItem[],
	enabled: () => boolean = () => true
): { readonly byItemId: Record<string, number> } {
	let byItemId = $state<Record<string, number>>({});

	$effect(() => {
		const list = items();
		if (!enabled() || list.length === 0) {
			byItemId = {};
			return;
		}

		// Cada cambio del carrito lanza una consulta nueva; sin abortar la
		// anterior, una respuesta lenta podría pisar a una más reciente.
		const abort = new AbortController();
		const ids = list.map((item) => item.id);

		fetch('/api/cart/stock', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			signal: abort.signal,
			body: JSON.stringify({
				items: list.map((item) => ({
					productId: item.productId,
					size: item.size,
					color: item.color
				}))
			})
		})
			.then((res) => res.json())
			.then((data: { stock: number[] }) => {
				const next: Record<string, number> = {};
				ids.forEach((id, index) => {
					next[id] = data.stock[index] ?? 0;
				});
				byItemId = next;
			})
			.catch(() => {
				// Sin datos de stock no se limita nada en pantalla; el servidor
				// sigue siendo quien decide en el momento de pagar.
			});

		return () => abort.abort();
	});

	return {
		get byItemId() {
			return byItemId;
		}
	};
}
