import type { LayoutServerLoad } from './$types';
import { HOUSE_STORE } from '$lib/storefront/model';

export const load: LayoutServerLoad = () => {
	return { storefront: HOUSE_STORE };
};
