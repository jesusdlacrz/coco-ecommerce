<script lang="ts">
	import '../app.css';
	import Header from '$lib/shared/components/Header.svelte';
	import { cartItemCount } from '$lib/cart/stores/cartStore';
	import Footer from '$lib/shared/components/Footer.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}
	const { children }: Props = $props();
	let searchQuery = $state('');

	function handleCartClick() {
		// Dispatch custom event for cart opening
		window.dispatchEvent(new CustomEvent('openCart'));
	}

	function handleAccountClick() {
		console.log('Account clicked - implement navigation');
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
