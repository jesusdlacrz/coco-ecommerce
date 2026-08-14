import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Product, CartItem } from '$lib/shared/model/products';
import { displayPrice, strikePrice } from '$lib/shared/utils/price';

// Clave histórica de la casa — se mantiene igual para no perder carritos
// ya guardados en localStorage de antes de esta feature.
const LEGACY_KEY = 'cart';

function readFromStorage(key: string): CartItem[] {
	if (!browser) return [];
	try {
		const stored = localStorage.getItem(key);
		if (!stored) return [];
		const parsed = JSON.parse(stored);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		console.warn('Error loading cart from localStorage:', error);
		return [];
	}
}

function writeToStorage(key: string, items: CartItem[]): void {
	if (!browser) return;
	try {
		localStorage.setItem(key, JSON.stringify(items));
	} catch (error) {
		console.warn('Error saving to localStorage:', error);
	}
}

// =================== SIMPLE CART STORE ===================
function createCartStore() {
	let currentKey = LEGACY_KEY;

	// Store principal
	const { subscribe, set, update } = writable<CartItem[]>(readFromStorage(currentKey));

	const saveToStorage = (items: CartItem[]) => writeToStorage(currentKey, items);

	return {
		subscribe,

		// Cambia de carrito al entrar/salir de la revista de un vendedor —
		// persiste el activo antes de cargar el de la nueva clave, así un
		// cliente que navega entre dos vendedores nunca mezcla precios de
		// comisiones distintas en un mismo total.
		useStore: (cartKey: string) => {
			if (cartKey === currentKey) return;
			currentKey = cartKey;
			set(readFromStorage(cartKey));
		},

		// Agregar item al carrito
		addItem: (
			product: Product,
			quantity: number,
			size: string | null,
			color: string | null,
			vendorSlug: string | null = null
		) => {
			update((items) => {
				const existingIndex = items.findIndex(
					(item) => item.productId === product.id && item.size === size && item.color === color
				);

				if (existingIndex !== -1) {
					items[existingIndex].quantity += quantity;
				} else {
					const now = new Date().toISOString();
					const newItem: CartItem = {
						id: `${product.id}-${Date.now()}`,
						productId: product.id,
						name: product.name,
						price: displayPrice(product),
						originalPrice: strikePrice(product) ?? undefined,
						image: product.images[0] || '',
						category: product.category,
						quantity,
						size,
						color,
						gender: product.gender,
						sku: product.sku,
						minOrderQuantity: product.minOrderQuantity,
						vendorSlug,
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
			update((items) => {
				const index = items.findIndex((item) => item.id === itemId);
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
			update((items) => {
				const filtered = items.filter((item) => item.id !== itemId);

				// Auto-save optimizado
				saveToStorage(filtered);

				return filtered;
			});
		},

		// El precio en localStorage es caché, no la fuente de verdad: si el
		// vendedor cambió su comisión, esto lo corrige. `null` en el mapa
		// significa que la prenda ya no existe o fue ocultada — se elimina.
		applyPriceUpdates: (updates: Map<string, number | null>) => {
			update((items) => {
				const next = items
					.map((item) => {
						if (!updates.has(item.productId)) return item;
						const price = updates.get(item.productId);
						return price === null ? null : { ...item, price };
					})
					.filter((item): item is CartItem => item !== null);

				saveToStorage(next);
				return next;
			});
		},

		// Limpiar carrito
		clearCart: () => {
			set([]);
			if (browser) {
				try {
					localStorage.removeItem(currentKey);
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
	$items.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const cartItemCount = derived(cartItems, ($items) =>
	$items.reduce((total, item) => total + item.quantity, 0)
);

export const totalUnits = derived(cartItems, ($items) =>
	$items.reduce((total, item) => total + item.quantity, 0)
);

export const canProceedToPayment = derived(totalUnits, ($totalUnits) => $totalUnits >= 4);

export const missingUnitsForPayment = derived(totalUnits, ($totalUnits) =>
	Math.max(0, 4 - $totalUnits)
);
