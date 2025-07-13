import { KeysStorage } from '$lib/shared/model/keysStorage.model';
import { browser } from '$app/environment';
import type { CartItem } from '$lib/shared/model/products';
export class CartStorage {
	static load(): CartItem[] {
		if (!browser) return [];

		try {
			const stored = localStorage.getItem(KeysStorage.CART);
			return stored ? JSON.parse(stored) : [];
		} catch (error) {
			console.error('Error loading cart from localStorage:', error);
			return [];
		}
	}

	static save(items: CartItem[]): void {
		if (!browser) return;

		try {
			localStorage.setItem(KeysStorage.CART, JSON.stringify(items));
		} catch (error) {
			console.error('Error saving cart to localStorage:', error);
		}
	}

	static clear(): void {
		if (!browser) return;
		localStorage.removeItem(KeysStorage.CART);
	}
}
