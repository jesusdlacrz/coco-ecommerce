import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getVendorCartPrices } from '$lib/pricing/catalog.server';

interface RevalidateLine {
	/** Id de la línea del carrito (producto + talla + color). */
	id: string;
	productId: string;
	size: string | null;
	color: string | null;
}

// Precio vigente de cada LÍNEA del carrito de un vendedor: la talla/color
// importa porque pueden tener precios distintos. POST porque cada línea lleva
// talla y color; responde { prices: { [idDeLínea]: precio | null } }.
export const POST: RequestHandler = async ({ params, request, fetch }) => {
	const body = (await request.json().catch(() => null)) as { items?: RevalidateLine[] } | null;
	const items = (body?.items ?? []).filter((i) => i?.id && i?.productId).slice(0, 200);
	if (!body) throw error(400, 'Petición inválida');
	if (items.length === 0) return json({ prices: {} });

	const prices = await getVendorCartPrices(
		params.slug,
		items.map(({ productId, size, color }) => ({ productId, size: size ?? null, color: color ?? null })),
		fetch
	);
	return json({ prices: Object.fromEntries(items.map((item, i) => [item.id, prices[i]])) });
};
