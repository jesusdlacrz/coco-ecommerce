<script lang="ts">
	import CatalogPage from '$lib/cart/components/CatalogPage.svelte';
	import CartDrawer from '$lib/cart/components/CartDrawer.svelte';
	import {
		cartStore,
		cartItems,
		cartTotal,
		totalUnits,
		canProceedToPayment,
		missingUnitsForPayment
	} from '$lib/cart/stores/cartStore';
	import { formatPrice } from '$lib/shared/utils/cartUtils';
	import { sampleProducts } from '$lib/data/products';
	import type { Product } from '$lib/shared/model/products';
	import { onMount } from 'svelte';

	// =================== STATE ===================
	let isCartOpen = $state(false);
	let activeTab = $state<'men' | 'women'>('men');

	// =================== DERIVED DATA (LAZY LOADING) ===================
	const menProducts = $derived(sampleProducts.filter((p) => p.gender === 'men'));
	const womenProducts = $derived(sampleProducts.filter((p) => p.gender === 'women'));

	// =================== LIFECYCLE ===================
	onMount(() => {
		// Listen for cart open events from header
		const handleOpenCart = () => {
			isCartOpen = true;
		};

		window.addEventListener('openCart', handleOpenCart);

		return () => {
			window.removeEventListener('openCart', handleOpenCart);
		};
	});

	// =================== CART HANDLERS ===================
	function handleAddToCart(
		product: Product,
		quantity: number,
		size: string | null,
		color: string | null
	) {
		cartStore.addItem(product, quantity, size, color);
	}

	function handleUpdateQuantity(itemId: string, quantity: number) {
		cartStore.updateQuantity(itemId, quantity);
	}

	function handleRemoveItem(itemId: string) {
		cartStore.removeItem(itemId);
	}

	function handleClearCart() {
		cartStore.clearCart();
	}

	// =================== UI HANDLERS ===================
	function handleCartClose() {
		isCartOpen = false;
	}

	function handleTabChange(tab: 'men' | 'women') {
		console.log(`Switching to ${tab} tab`);
		activeTab = tab;
	}
</script>

<svelte:head>
	<title>Coco's - E-commerce Mayorista</title>
</svelte:head>

<div class="bg-gray-50">
	<!-- Main Catalog -->
	<CatalogPage
		{activeTab}
		{menProducts}
		{womenProducts}
		totalUnits={$totalUnits}
		cartTotal={$cartTotal}
		canProceedToPayment={$canProceedToPayment}
		missingUnitsForPayment={$missingUnitsForPayment}
		{formatPrice}
		onTabChange={handleTabChange}
		onAddToCart={handleAddToCart}
	/>

	<!-- Cart Drawer -->
	<CartDrawer
		isOpen={isCartOpen}
		cartItems={$cartItems}
		onClose={handleCartClose}
		onUpdateQuantity={handleUpdateQuantity}
		onRemoveItem={handleRemoveItem}
		onClearCart={handleClearCart}
	/>
</div>
