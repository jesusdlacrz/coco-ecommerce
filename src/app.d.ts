// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SafeVendor } from '$lib/vendors/model/vendor';
import type { Storefront } from '$lib/storefront/model';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			vendor: SafeVendor | null;
		}
		interface PageData {
			storefront?: Storefront;
			vendor?: SafeVendor;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
