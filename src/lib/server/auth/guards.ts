import { error } from '@sveltejs/kit';
import type { SafeVendor } from '$lib/vendors/model/vendor';

// Defensa en profundidad: el layout `/panel` ya redirige si no hay sesión,
// pero las form actions no heredan esa garantía automáticamente — cada
// action que muta datos debe llamar esto explícitamente.
export function requireVendor(vendor: SafeVendor | null): SafeVendor {
	if (!vendor || vendor.status !== 'approved') {
		error(401, 'No autorizado');
	}
	return vendor;
}
