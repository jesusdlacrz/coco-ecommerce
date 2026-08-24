import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCartStock, type CartStockCheck } from '$lib/pricing/catalog.server';

// El stock es el mismo sin importar el vendedor (misma prenda física) — este
// endpoint lo usa el carrito (casa o revista de vendedor) para limitar la
// cantidad editable a lo que de verdad hay, no solo lo que ya se valida en
// `checkout/start`. Mismo orden de entrada/salida para que el cliente pueda
// mapear por índice.
export const POST: RequestHandler = async ({ request, fetch }) => {
	const body = (await request.json()) as { items?: CartStockCheck[] };
	const items = body.items ?? [];
	if (items.length === 0) return json({ stock: [] });
	const stock = await getCartStock(items, fetch);
	return json({ stock });
};
