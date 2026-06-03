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
		class="w-full flex items-center justify-center space-x-2 bg-[#FCA120] text-white py-3 px-6 rounded-lg hover:bg-[#fca020d2] transition-colors font-medium"
	>
		<ShoppingCart size={20} />
		<span>Agregar al Carrito</span>
	</button>
	
	<button
		onclick={onBuyNow}
		class="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-medium"
	>
		Comprar Ahora
	</button>
</div>
