import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getVendorCartPrices } from '$lib/pricing/catalog.server';

export const GET: RequestHandler = async ({ params, url, fetch }) => {
	const ids = (url.searchParams.get('ids') ?? '')
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean);

	if (ids.length === 0) return json({ prices: {} });

	const prices = await getVendorCartPrices(params.slug, ids, fetch);
	return json({ prices });
};
