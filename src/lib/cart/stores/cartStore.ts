import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Product, CartItem } from '$lib/shared/model/products';
import { displayPrice, strikePrice } from '$lib/shared/utils/price';

// Clave histórica de la casa — se mantiene igual para no perder carritos
// ya guardados en localStorage de antes de esta feature.
const LEGACY_KEY = 'cart';

// Mínimo mayorista — usado también por el checkout en el servidor para
// rechazar un intento de pago que no lo cumpla.
export const MIN_PAYMENT_UNITS = 4;

// La identidad de una línea del carrito es producto + talla + color + vendedor:
// es exactamente el criterio con el que `addItem` decide si suma cantidad o crea
// una línea nueva. Derivar el `id` de esa identidad —en vez de usar un
// timestamp— hace imposible que dos líneas compartan `id`.
//
// Antes el id era `${productId}-${Date.now()}`, que colisiona si dos añadidos
// caen en el mismo milisegundo. Con ids repetidos, el `{#each ... (item.id)}`
// del checkout solo pintaba una de las líneas mientras el subtotal seguía
// sumándolas todas: el carrito decía 10 unidades y el resumen mostraba 4.
export function cartItemId(
	productId: string,
	size: string | null,
	color: string | null,
	vendorSlug: string | null
): string {
	return [productId, size ?? '', color ?? '', vendorSlug ?? ''].join('::');
}

// Normaliza lo que haya en localStorage: reasigna ids deterministas y fusiona
// cualquier línea duplicada que venga de una versión anterior.
function normalizeItems(items: CartItem[]): CartItem[] {
	const byId = new Map<string, CartItem>();
	for (const item of items) {
		const id = cartItemId(item.productId, item.size, item.color, item.vendorSlug ?? null);
		const existing = byId.get(id);
		if (existing) {
			existing.quantity += item.quantity;
			existing.updatedAt = new Date().toISOString();
		} else {
			byId.set(id, { ...item, id });
		}
	}
	return [...byId.values()];
}

function readFromStorage(key: string): CartItem[] {
	if (!browser) return [];
	try {
		const stored = localStorage.getItem(key);
		if (!stored) return [];
		const parsed = JSON.parse(stored);
		return Array.isArray(parsed) ? normalizeItems(parsed as CartItem[]) : [];
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

// Toda mutación crea objetos y array nuevos, nunca modifica los existentes.
//
// No es una preferencia de estilo: `cartTotal` es un `derived`, y un `derived`
// recalcula ante cualquier notificación aunque el valor sea el mismo objeto.
// El `{#each}` que pinta las líneas, en cambio, compara identidades. Al mutar
// `item.quantity` en su sitio y devolver el mismo array, el total cambiaba y
// la línea no: el resumen del pago mostraba «6 · $390.000» junto a un subtotal
// de $130.000. Con objetos nuevos ambas cosas leen lo mismo por construcción.
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
				const id = cartItemId(product.id, size, color, vendorSlug);
				const existingIndex = items.findIndex((item) => item.id === id);
				const now = new Date().toISOString();
				let next: CartItem[];

				if (existingIndex !== -1) {
					next = items.map((item, i) =>
						i === existingIndex
							? { ...item, quantity: item.quantity + quantity, updatedAt: now }
							: item
					);
				} else {
					const newItem: CartItem = {
						id,
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
					next = [...items, newItem];
				}

				saveToStorage(next);
				return next;
			});
		},

		// Actualizar cantidad
		updateQuantity: (itemId: string, quantity: number) => {
			update((items) => {
				const next =
					quantity <= 0
						? items.filter((item) => item.id !== itemId)
						: items.map((item) =>
								item.id === itemId
									? { ...item, quantity, updatedAt: new Date().toISOString() }
									: item
							);

				saveToStorage(next);
				return next;
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

export const canProceedToPayment = derived(totalUnits, ($totalUnits) => $totalUnits >= MIN_PAYMENT_UNITS);

export const missingUnitsForPayment = derived(totalUnits, ($totalUnits) =>
	Math.max(0, MIN_PAYMENT_UNITS - $totalUnits)
);
