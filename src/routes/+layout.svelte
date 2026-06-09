<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Header from '$lib/shared/components/Header.svelte';
	import { cartItemCount, cartStore, cartItems } from '$lib/cart/stores/cartStore';
	import { Toaster } from 'svelte-5-french-toast';
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
	let currentCategory = $state<Category>('women');

	// Detect exact products index vs product detail
	const path = $derived($page.url.pathname.replace(/\/+$/, ''));
	const isProductsPage = $derived(path === '/productos');
	const isHomePage = $derived(path === '');
	
	// Get background color for productos page
	const categoryBackgrounds = {
		women: 'bg-[#f8f4fc]', 
		men: 'bg-[#f0fcfc]',
		girls: 'bg-[#ffecf4]',
		boys: 'bg-[#f0f4fc]',
	};
	
	const currentBackground = $derived(isProductsPage ? categoryBackgrounds[currentCategory] : '');

	// Update category from URL params more responsively
	$effect(() => {
		const categoryParam = $page.url.searchParams.get('category');
		if (categoryParam && [ 'women', 'men', 'girls', 'boys'].includes(categoryParam)) {
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
	useDynamicColors={isProductsPage}
	backgroundColor={currentBackground}
/>
<Toaster/>
<main class="min-h-screen {currentBackground} transition-colors duration-700">
	{@render children?.()}
</main>

{#if !isHomePage}
	<Footer backgroundColor={currentBackground} />
{/if}

<CartDrawer
	isOpen={isCartOpen}
	cartItems={$cartItems}
	onClose={handleCloseCart}
	onUpdateQuantity={handleUpdateQuantity}
	onRemoveItem={handleRemoveItem}
	onClearCart={handleClearCart}
/>
