<script lang="ts">
	import ProductPreview from '$lib/cart/components/ProductPreview.svelte';
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
	import { sampleProducts } from '$lib/data/products';
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

	function handleTabChange(tab: 'men' | 'women' | 'boys' | 'girls') {
		activeTab = tab;
	}

	function handleProductClick(productId: string) {
		goto(`/productos/${productId}`);
	}
</script>

<svelte:head>
	<title>Productos - Coco's</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Page Header -->
	<div class="mb-8 text-center text-[#484848]">
		<h2 class="mb-4 text-3xl" style="font-family: 'Volkhov', serif; font-weight: 400; font-style: normal;">
			Todos los Productos
		</h2>
		<p class="text-sm text-[#8A8A8A]">
			Explora toda nuestra colección. Haz clic en cualquier producto para ver detalles completos.
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

	<!-- Catalog Preview - Sin límite de productos para /productos -->
	<div class="space-y-6">
		<!-- Grid de productos - Todos los productos sin límite -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
			{#each currentProducts as product (product.id)}
				<ProductPreview {product} onProductClick={handleProductClick} />
			{/each}
		</div>

		{#if currentProducts.length === 0}
			<div class="text-center py-12">
				<p class="text-gray-500">No hay productos disponibles en esta categoría</p>
			</div>
		{/if}
	</div>
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
