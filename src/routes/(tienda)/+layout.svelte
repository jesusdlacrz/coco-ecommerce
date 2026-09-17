<script lang="ts">
	import Header from '$lib/shared/components/Header.svelte';
	import { cartItemCount, cartStore, cartItems } from '$lib/cart/stores/cartStore';
	import { activeCategory, type Category } from '$lib/shared/stores/categoryStore';
	import Footer from '$lib/shared/components/Footer.svelte';
	import CartDrawer from '$lib/cart/components/CartDrawer.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { HOUSE_STORE } from '$lib/storefront/model';
	import { categoryStyles } from '$lib/products/filters/categoryStyles';
	import CatalogSkeleton from '$lib/shared/components/skeletons/CatalogSkeleton.svelte';
	import ProductSkeleton from '$lib/shared/components/skeletons/ProductSkeleton.svelte';
	import { createPendingSkeleton } from '$lib/shared/services/pendingNavigation.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}
	const { children }: Props = $props();

	const store = $derived(page.data.storefront ?? HOUSE_STORE);

	// Cada revista de vendedor tiene su propio carrito — evita mezclar
	// precios con comisiones distintas si el cliente navega entre tiendas.
	$effect(() => {
		cartStore.useStore(store.cartKey);
	});

	// =================== CART STATE ===================
	// El esqueleto vive en el layout, no en la página: durante una navegación la
	// página de destino todavía no está montada, así que ella no puede
	// anunciarse a sí misma.
	const pending = createPendingSkeleton();

	let isCartOpen = $state(false);
	let currentCategory = $state<Category>('women');

	// Detect exact products index vs product detail
	const path = $derived(page.url.pathname.replace(/\/+$/, ''));
	const isProductsPage = $derived(path === '/productos');
	const isHomePage = $derived(path === '');

	// Get background color for productos page
	const currentBackground = $derived(
		isProductsPage ? categoryStyles[currentCategory].tint : ''
	);

	// Update category from URL params more responsively
	$effect(() => {
		const categoryParam = page.url.searchParams.get('category');
		if (categoryParam && ['women', 'men', 'girls', 'boys'].includes(categoryParam)) {
			const category = categoryParam as Category;
			currentCategory = category;
			activeCategory.set(category);
		}
	});

	// =================== LIFECYCLE ===================
	onMount(() => {
		// El header abre el carrito por la prop `onCartClick`; el evento
		// 'openCart' que se escuchaba aquí no lo despachaba nadie.
		return activeCategory.subscribe((category) => {
			currentCategory = category;
		});
	});

	// =================== CART HANDLERS ===================
	function handleCartClick() {
		isCartOpen = true;
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

	function handleCloseCart() {
		isCartOpen = false;
	}

	function handleCheckout() {
		isCartOpen = false;
		goto(`${store.basePath}/carrito`);
	}
</script>

<Header
	cartItemCount={$cartItemCount}
	onCartClick={handleCartClick}
	useDynamicColors={isProductsPage}
	backgroundColor={currentBackground}
/>
<div class="{currentBackground} transition-colors duration-700">
	<main class="min-h-screen">
		{#if pending.kind === 'catalog'}
			<CatalogSkeleton />
		{:else if pending.kind === 'product'}
			<ProductSkeleton />
		{:else}
			{@render children?.()}
		{/if}
	</main>

	{#if !isHomePage}
		<Footer />
	{/if}
</div>

<CartDrawer
	isOpen={isCartOpen}
	cartItems={$cartItems}
	onClose={handleCloseCart}
	onUpdateQuantity={handleUpdateQuantity}
	onRemoveItem={handleRemoveItem}
	onClearCart={handleClearCart}
	onCheckout={handleCheckout}
/>
