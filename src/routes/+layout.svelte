<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Header from '$lib/shared/components/Header.svelte';
	import { cartItemCount, cartStore, cartItems } from '$lib/cart/stores/cartStore';
	import Footer from '$lib/shared/components/Footer.svelte';
	import CartDrawer from '$lib/cart/components/CartDrawer.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}
	const { children }: Props = $props();

	// =================== CART STATE ===================
	let isCartOpen = $state(false);

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
