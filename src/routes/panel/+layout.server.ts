import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
	if (!locals.vendor) {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		redirect(303, `/vendedores/ingresar?redirigir=${redirectTo}`);
	}
	if (locals.vendor.status === 'suspended' && url.pathname !== '/panel/suspendida') {
		redirect(303, '/panel/suspendida');
	}
	return { vendor: locals.vendor };
};
