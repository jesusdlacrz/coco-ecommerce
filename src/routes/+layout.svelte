<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Header from '$lib/shared/components/Header.svelte';
	import { cartItemCount, cartStore, cartItems } from '$lib/cart/stores/cartStore';
	import { activeCategory, type Category } from '$lib/shared/stores/categoryStore';
	import Footer from '$lib/shared/components/Footer.svelte';
	import CartDrawer from '$lib/cart/components/CartDrawer.svelte';
	import { page } from '$app/stores';

	interface Props {
		children?: import('svelte').Snippet;
	}
	const { children }: Props = $props();

	// =================== CART STATE ===================
	let isCartOpen = $state(false);
	let currentCategory = $state<Category>('men');

	// Check if we're on the productos page or product detail page
	const isProductsPage = $derived($page.url.pathname.startsWith('/productos'));

	// Update category from URL params more responsively
	$effect(() => {
		const categoryParam = $page.url.searchParams.get('category');
		if (categoryParam && ['men', 'women', 'boys', 'girls'].includes(categoryParam)) {
			const category = categoryParam as Category;
			currentCategory = category;
			activeCategory.set(category);
		}
	});

	// =================== LIFECYCLE ===================
	onMount(() => {
		// Listen for cart open events from header
		const handleOpenCart = () => {
			isCartOpen = true;
		};
		window.addEventListener('openCart', handleOpenCart);
		
		// Subscribe to category changes
		const unsubscribe = activeCategory.subscribe((category) => {
			currentCategory = category;
		});

		return () => {
			window.removeEventListener('openCart', handleOpenCart);
			unsubscribe();
		};
	});

	// =================== CART HANDLERS ===================
	function handleCartClick() {
		isCartOpen = true;
	}

	function handleAccountClick() {
		console.log('Account clicked - implement navigation');
	}

	function handleUpdateQuantity(itemId: string, quantity: number) {
		console.log('Updating quantity:', { itemId, quantity });
		cartStore.updateQuantity(itemId, quantity);
	}

	function handleRemoveItem(itemId: string) {
		console.log('Removing item:', itemId);
		cartStore.removeItem(itemId);
	}

	function handleClearCart() {
		cartStore.clearCart();
	}

	function handleCloseCart() {
		isCartOpen = false;
	}
</script>

<Header
	cartItemCount={$cartItemCount}
	onCartClick={handleCartClick}
	onAccountClick={handleAccountClick}
	currentCategory={currentCategory}
	useDynamicColors={isProductsPage}
/>

<main class="min-h-screen">
	{@render children?.()}
</main>

<Footer />

<CartDrawer
	isOpen={isCartOpen}
	cartItems={$cartItems}
	onClose={handleCloseCart}
	onUpdateQuantity={handleUpdateQuantity}
	onRemoveItem={handleRemoveItem}
	onClearCart={handleClearCart}
/>
