<script lang="ts">
	import type { CartItem } from '$lib/shared/model/products';
	import CartHeader from './CartHeader.svelte';
	import CartContent from './CartContent.svelte';
	import CartFooter from './CartFooter.svelte';

	interface Props {
		isOpen: boolean;
		cartItems: CartItem[];
		onClose: () => void;
		onUpdateQuantity: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
		onClearCart: () => void;
		onCheckout: () => void;
	}

	let { isOpen, cartItems, onClose, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout }: Props = $props();

	// Hacer que estos valores sean reactivos usando $derived con cartItems
	// Usamos el spread operator para forzar la reactividad
	const total = $derived([...cartItems].reduce((sum, item) => sum + item.price * item.quantity, 0));
	const totalItems = $derived([...cartItems].reduce((sum, item) => sum + item.quantity, 0));
	const menItems = $derived([...cartItems].filter((item) => item.gender === 'men'));
	const womenItems = $derived([...cartItems].filter((item) => item.gender === 'women'));
	const boysItems = $derived([...cartItems].filter((item) => item.gender === 'boys'));
	const girlsItems = $derived([...cartItems].filter((item) => item.gender === 'girls'));

	// Valores derivados adicionales para mejorar la reactividad
	const menItemsCount = $derived(menItems.reduce((sum, item) => sum + item.quantity, 0));
	const womenItemsCount = $derived(womenItems.reduce((sum, item) => sum + item.quantity, 0));
	const boysItemsCount = $derived(boysItems.reduce((sum, item) => sum + item.quantity, 0));
	const girlsItemsCount = $derived(girlsItems.reduce((sum, item) => sum + item.quantity, 0));

	const canCheckout = $derived(totalItems >= 4);
	const missingUnits = $derived(Math.max(0, 4 - totalItems));
</script>

{#if isOpen}
	<!-- Overlay -->
	<button class="fixed inset-0 z-40 bg-black/50" onclick={onClose} aria-label="Cerrar carrito"
	></button>

	<!-- Drawer -->
	<div class="fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white sm:max-w-lg">
		<CartHeader 
			{totalItems} 
			{total} 
			{onClose} 
		/>

		<CartContent 
			{cartItems}
			{menItems}
			{womenItems}
			{boysItems}
			{girlsItems}
			{menItemsCount}
			{womenItemsCount}
			{boysItemsCount}
			{girlsItemsCount}
			{onUpdateQuantity}
			{onRemoveItem}
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
