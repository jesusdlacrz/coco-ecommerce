import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Product, CartItem } from '$lib/shared/model/products';

// =================== SIMPLE CART STORE ===================
function createCartStore() {
	// Estado inicial seguro
	const initialItems: CartItem[] = [];
	
	// Store principal
	const { subscribe, set, update } = writable<CartItem[]>(initialItems);

	// Auto-cargar desde localStorage cuando esté disponible (solo una vez)
	let isInitialized = false;
	if (browser && !isInitialized) {
		try {
			const stored = localStorage.getItem('cart');
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) {
					set(parsed);
				}
			}
			isInitialized = true;
		} catch (error) {
			console.warn('Error loading cart from localStorage:', error);
			set(initialItems);
		}
	}

	// Función optimizada para guardar (con debounce implícito)
	const saveToStorage = (items: CartItem[]) => {
		if (browser) {
			try {
				localStorage.setItem('cart', JSON.stringify(items));
			} catch (error) {
				console.warn('Error saving to localStorage:', error);
			}
		}
	};

	return {
		subscribe,
		
		// Agregar item al carrito
		addItem: (product: Product, quantity: number, size: string | null, color: string | null) => {
			update(items => {
				const existingIndex = items.findIndex(item => 
					item.productId === product.id && 
					item.size === size && 
					item.color === color
				);

				if (existingIndex !== -1) {
					items[existingIndex].quantity += quantity;
				} else {
					const now = new Date().toISOString();
					const newItem: CartItem = {
						id: `${product.id}-${Date.now()}`,
						productId: product.id,
						name: product.name,
						price: product.price,
						image: product.images[0] || '',
						category: product.category,
						quantity,
						size,
						color,
						gender: product.gender,
						sku: product.sku,
						minOrderQuantity: product.minOrderQuantity,
						addedAt: now,
						updatedAt: now
					};
					items.push(newItem);
				}

				// Auto-save optimizado
				saveToStorage(items);

				return items;
			});
		},

		// Actualizar cantidad
		updateQuantity: (itemId: string, quantity: number) => {
			update(items => {
				const index = items.findIndex(item => item.id === itemId);
				if (index !== -1) {
					if (quantity <= 0) {
						items.splice(index, 1);
					} else {
						items[index].quantity = quantity;
					}
				}

				// Auto-save optimizado
				saveToStorage(items);

				return items;
			});
		},

		// Remover item
		removeItem: (itemId: string) => {
			update(items => {
				const filtered = items.filter(item => item.id !== itemId);
				
				// Auto-save optimizado
				saveToStorage(filtered);
				
				return filtered;
			});
		},

		// Limpiar carrito
		clearCart: () => {
			set([]);
			if (browser) {
				try {
					localStorage.removeItem('cart');
				} catch (error) {
					console.warn('Error clearing localStorage:', error);
				}
			}
		}
	};
}

// =================== STORE INSTANCE ===================
export const cartStore = createCartStore();

// =================== DERIVED STORES ===================
export const cartItems = cartStore;

export const cartTotal = derived(cartItems, ($items) => 
	$items.reduce((total, item) => total + (item.price * item.quantity), 0)
);

export const cartItemCount = derived(cartItems, ($items) => 
	$items.reduce((total, item) => total + item.quantity, 0)
);

export const totalUnits = derived(cartItems, ($items) => 
	$items.reduce((total, item) => total + item.quantity, 0)
);

export const canProceedToPayment = derived(totalUnits, ($totalUnits) => 
	$totalUnits >= 4
);

export const missingUnitsForPayment = derived(totalUnits, ($totalUnits) => 
	Math.max(0, 4 - $totalUnits)
);