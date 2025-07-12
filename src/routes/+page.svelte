<script lang="ts">
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';
	import { onMount } from 'svelte';
	import { ShoppingCart, User } from '@lucide/svelte';
	import ProductCard from '$lib/shared/components/ProductCard.svelte';
	import CartDrawer from '$lib/shared/components/CartDrawer.svelte';
	import { cartStore, cartItems, cartItemCount, cartTotal } from '$lib/cart/stores/cartStore';
	import { formatPrice } from '$lib/utils/cartUtils';
	import { sampleProducts } from '$lib/data/products';
	import type { Product } from '$lib/types/products';

	let isCartOpen = $state(false);
	let activeTab = $state('men');

	const menProducts = sampleProducts.filter((p) => p.gender === 'men');
	const womenProducts = sampleProducts.filter((p) => p.gender === 'women');

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
</script>

<svelte:head>
	<title>Coco's - E-commerce Mayorista</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="border-b bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center space-x-4">
					<h1 class="text-2xl font-bold text-gray-900">
						Coco's <span class="text-blue-600">Store</span>
					</h1>
					<span
						class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"
					>
						Mayorista
					</span>
				</div>

				<div class="flex items-center space-x-4">
					<button
						class="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
					>
						<User class="h-4 w-4" />
						<span>Mi Cuenta</span>
					</button>

					<button
						onclick={() => (isCartOpen = true)}
						class="relative flex items-center space-x-2 rounded border border-gray-300 px-3 py-1 hover:bg-gray-50"
					>
						<ShoppingCart class="h-4 w-4" />
						<span>Carrito</span>
						{#if $cartItemCount > 0}
							<span
								class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
							>
								{$cartItemCount}
							</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="mb-8">
			<h2 class="mb-2 text-3xl font-bold text-gray-900">Catálogo Mayorista</h2>
			<p class="text-gray-600">
				Precios especiales para mayoristas • Cantidades mínimas por producto
			</p>
			{#if $cartItemCount > 0}
				<div class="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
					<p class="text-green-800">
						<strong>{$cartItemCount}</strong> productos en tu carrito • Total:
						<strong>{formatPrice($cartTotal)}</strong>
					</p>
				</div>
			{/if}
		</div>

		<!-- Tabs -->
		<div class="mb-8">
			<div class="flex space-x-1 rounded-lg bg-gray-100 p-1">
				<button
					onclick={() => {
						console.log('Switching to men tab');
						activeTab = 'men';
					}}
					class="flex flex-1 items-center justify-center space-x-2 rounded-md px-4 py-2 transition-colors {activeTab ===
					'men'
						? 'bg-blue-600 text-white'
						: 'text-gray-700 hover:text-gray-900'}"
				>
					<div class="h-3 w-3 rounded-full bg-blue-600"></div>
					<span>Hombres ({menProducts.length})</span>
				</button>
				<button
					onclick={() => {
						console.log('Switching to women tab');
						activeTab = 'women';
					}}
					class="flex flex-1 items-center justify-center space-x-2 rounded-md px-4 py-2 transition-colors {activeTab ===
					'women'
						? 'bg-pink-600 text-white'
						: 'text-gray-700 hover:text-gray-900'}"
				>
					<div class="h-3 w-3 rounded-full bg-pink-600"></div>
					<span>Mujeres ({womenProducts.length})</span>
				</button>
			</div>
		</div>

		<!-- Tab Content -->
		{#if activeTab === 'men'}
			<div class="space-y-6">
				<div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
					<h3 class="mb-2 font-semibold text-blue-900">Sección Masculina</h3>
					<p class="text-sm text-blue-700">
						Ropa formal y casual para hombres con precios mayoristas especiales
					</p>
				</div>

				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each menProducts as product}
						<ProductCard {product} onAddToCart={handleAddToCart} />
					{/each}
				</div>
			</div>
		{:else}
			<div class="space-y-6">
				<div class="mb-6 rounded-lg border border-pink-200 bg-pink-50 p-4">
					<h3 class="mb-2 font-semibold text-pink-900">Sección Femenina</h3>
					<p class="text-sm text-pink-700">
						Ropa elegante y moderna para mujeres con descuentos por volumen
					</p>
				</div>

				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each womenProducts as product}
						<ProductCard {product} onAddToCart={handleAddToCart} />
					{/each}
				</div>
			</div>
		{/if}
	</main>

	<!-- Cart Drawer -->
	<CartDrawer
		isOpen={isCartOpen}
		cartItems={$cartItems}
		onClose={() => (isCartOpen = false)}
		onUpdateQuantity={handleUpdateQuantity}
		onRemoveItem={handleRemoveItem}
		onClearCart={handleClearCart}
	/>

	<!-- Footer -->
	<footer class="mt-16 border-t bg-white">
		<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div class="text-center text-gray-600">
				<p>© 2024 Coco's - E-commerce Mayorista</p>
				<p class="mt-2 text-sm">Precios especiales para distribuidores y mayoristas</p>
			</div>
		</div>
	</footer>
</div>

<TransitionLink href="/productos">JEJEJJEJE2</TransitionLink>
