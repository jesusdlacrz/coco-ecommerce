<script lang="ts">
	import CatalogPreview from '$lib/cart/components/CatalogPreview.svelte';
	import CategoryTabs from '$lib/cart/components/CategoryTabs.svelte';
	import CartDrawer from '$lib/cart/components/CartDrawer.svelte';
	import { goto } from '$app/navigation';
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
	let activeTab = $state<'men' | 'women' | 'boys' | 'girls'>('men');

	// =================== DERIVED DATA ===================
	const menProducts = sampleProducts.filter((p) => p.gender === 'men');
	const womenProducts = sampleProducts.filter((p) => p.gender === 'women');
	const boysProducts = sampleProducts.filter((p) => p.gender === 'boys');
	const girlsProducts = sampleProducts.filter((p) => p.gender === 'girls');

	const currentProducts = $derived(
		activeTab === 'men' ? menProducts :
		activeTab === 'women' ? womenProducts :
		activeTab === 'boys' ? boysProducts :
		girlsProducts
	);

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

	function handleTabChange(tab: 'men' | 'women' | 'boys' | 'girls') {
		console.log(`Switching to ${tab} tab`);
		activeTab = tab;
	}

	function handleProductClick(productId: string) {
		goto(`/productos/${productId}`);
	}
</script>

<svelte:head>
	<title>Coco's</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Page Header -->
	<div class="mb-8 text-center text-[#484848]">
		<h2 class="mb-4 text-3xl" style="">
			Catálogo Preview
		</h2>
		<p class="text-sm text-[#8A8A8A]">
			Vista previa de nuestros productos. Haz clic en cualquier producto para ver detalles completos.
		</p>
	</div>

	<!-- Category Tabs -->
	<CategoryTabs
		{activeTab}
		menProductsCount={menProducts.length}
		womenProductsCount={womenProducts.length}
		boysProductsCount={boysProducts.length}
		girlsProductsCount={girlsProducts.length}
		onTabChange={handleTabChange}
	/>

	<!-- Catalog Preview -->
	<CatalogPreview 
		products={currentProducts}
		{activeTab}
		onProductClick={handleProductClick}
	/>
</div>

<!-- Cart Drawer -->
<CartDrawer
	isOpen={isCartOpen}
	cartItems={$cartItems}
	onClose={handleCartClose}
	onUpdateQuantity={handleUpdateQuantity}
	onRemoveItem={handleRemoveItem}
	onClearCart={handleClearCart}
/>
