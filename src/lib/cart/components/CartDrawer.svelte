<script lang="ts">
	import type { CartItem } from '$lib/shared/model/products';
	import { createStockLookup } from '$lib/cart/services/stockLookup.svelte';
	import CartHeader from './CartHeader.svelte';
	import CartContent from './CartContent.svelte';
	import CartFooter from './CartFooter.svelte';
	import { page } from '$app/state';
	import { registerOverlay } from '$lib/shared/services/overlays';
	import { HOUSE_STORE } from '$lib/storefront/model';
	import {
		cartStore,
		cartTotal,
		cartItemCount,
		canProceedToPayment,
		missingUnitsForPayment
	} from '$lib/cart/stores/cartStore';
	import toast from 'svelte-5-french-toast';

	interface Props {
		isOpen: boolean;
		cartItems: CartItem[];
		onClose: () => void;
		onUpdateQuantity: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
		onClearCart: () => void;
		onCheckout: () => void;
	}

	let {
		isOpen,
		cartItems,
		onClose,
		onUpdateQuantity,
		onRemoveItem,
		onClearCart,
		onCheckout
	}: Props = $props();

	const store = $derived(page.data.storefront ?? HOUSE_STORE);

	// El precio en localStorage es caché, no la fuente de verdad: si el
	// vendedor cambió su comisión desde que se agregó la prenda, esto lo
	// corrige al abrir el carrito (no en cada carga de página).
	$effect(() => {
		if (!isOpen || store.kind !== 'vendor' || cartItems.length === 0) return;

		const ids = [...new Set(cartItems.map((item) => item.productId))];
		fetch(`${store.basePath}/carrito/revalidar?ids=${ids.map(encodeURIComponent).join(',')}`)
			.then((res) => res.json())
			.then((data: { prices: Record<string, number | null> }) => {
				const updates = new Map(Object.entries(data.prices));
				const changed = cartItems.some((item) => {
					const price = updates.get(item.productId);
					return price !== undefined && price !== item.price;
				});
				if (changed) {
					cartStore.applyPriceUpdates(updates);
					toast('Actualizamos los precios de tu carrito');
				}
			})
			.catch(() => {
				// Revalidación best-effort: si falla, el carrito sigue con el
				// último precio conocido en vez de romper la experiencia.
			});
	});

	// El stock (a diferencia del precio) es el mismo sin importar el
	// vendedor — se revalida siempre que se abre el carrito, para no dejar
	// subir la cantidad de una talla/color por encima de lo que de verdad
	// hay. Es solo la capa de UX: `checkout/start` es quien de verdad lo
	// bloquea si esto se salta.
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) onClose();
	}

	// El panel del carrito tapa la pantalla completa pero no bloqueaba el scroll:
	// el fondo se movía detrás. Usa el mismo lock con contador que el visor de
	// imágenes y la hoja de filtros.
	$effect(() => {
		if (isOpen) return registerOverlay('cart');
	});

	// Misma consulta de stock que el resumen del pedido, en un solo sitio.
	const stock = createStockLookup(
		() => cartItems,
		() => isOpen
	);

	// Las cifras salen de los mismos derivados que usan el header y el resumen
	// del pedido. Antes se recalculaban aquí con un `[...spread]` puesto para
	// «forzar la reactividad»: un parche contra la mutación en sitio del store,
	// que ya no existe, y una segunda implementación que podía discrepar.
	const total = $derived($cartTotal);
	const totalItems = $derived($cartItemCount);
	const canCheckout = $derived($canProceedToPayment);
	const missingUnits = $derived($missingUnitsForPayment);
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Overlay -->
	<button class="fixed inset-0 z-40 bg-ink/50" onclick={onClose} aria-label="Cerrar carrito"
	></button>

	<!-- Drawer. `role="dialog"` no es solo semántica: es la marca por la que el
	     resto del código (y el panel de diagnóstico) reconoce que hay un panel
	     modal legítimamente abierto. Sin ella, un carrito abierto se veía desde
	     fuera igual que un bloqueo de scroll huérfano. -->
	<div
		role="dialog"
		aria-modal="true"
		aria-label="Carro de compras"
		class="fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white sm:max-w-lg"
	>
		<CartHeader {totalItems} {total} {onClose} />

		<CartContent
			{cartItems}
			stockByItemId={stock.byItemId}
			{onUpdateQuantity}
			{onRemoveItem}
			onNavigate={onClose}
		/>

		<CartFooter
			{cartItems}
			{total}
			{totalItems}
			{canCheckout}
			{missingUnits}
			{onClearCart}
			{onCheckout}
		/>
	</div>
{/if}
