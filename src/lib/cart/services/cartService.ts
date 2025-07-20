import type { Product } from '$lib/shared/model/products';
import type { RequestState } from '$lib/shared/model/requestState.model';
import { HttpService } from '$lib/shared/services/httpService';
import type { Writable } from 'svelte/store';

export class CartService extends HttpService {
	constructor(url?: string) {
		super(url);
	}

	getCartItems(): [Writable<RequestState<Product[]>>, () => Promise<void>] {
		try {
			return this.get('/cart');
		} catch (error) {
			console.error(error);
			throw new Error('Failed to fetch cart items');
		}
	}
}

export const cartService = new CartService();