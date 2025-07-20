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

	// =================== DERIVED DATA ===================
	const menProducts = sampleProducts.filter((p) => p.gender === 'men');
	const womenProducts = sampleProducts.filter((p) => p.gender === 'women');

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
		console.log('Adding to cart:', { product: product.name, quantity, size, color });
		cartStore.addItem(product, quantity, size, color);
		console.log('Cart after adding:', $cartItems);
	}

	function handleUpdateQuantity(itemId: string, quantity: number) {
		console.log('Updating quantity:', { itemId, quantity });
		cartStore.updateQuantity(itemId, quantity);
		console.log('Cart after update:', $cartItems);
	}

	function handleRemoveItem(itemId: string) {
		console.log('Removing item:', itemId);
		cartStore.removeItem(itemId);
		console.log('Cart after removal:', $cartItems);
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
	<title>Coco's</title>
</svelte:head>

<div class="">
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
