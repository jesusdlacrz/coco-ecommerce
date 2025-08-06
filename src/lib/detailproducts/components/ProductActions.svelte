<script lang="ts">
	import ShoppingCart from '$lib/shared/icons/ShoppingCart.svelte';

	type Props = {
		onAddToCart: () => void;
		onBuyNow: () => void;
	};

	let { onAddToCart, onBuyNow }: Props = $props();
</script>

<!-- Botones de acción -->
<div class="space-y-3 pt-4">
	<button
		onclick={onAddToCart}
		class="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
	>
		<ShoppingCart size={20} />
		<span>Agregar al Carrito</span>
	</button>
	
	<button
		onclick={onBuyNow}
		class="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
	>
		Comprar Ahora
	</button>
</div>
