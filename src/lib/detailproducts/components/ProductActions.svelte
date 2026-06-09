<script lang="ts">
	type Props = {
		onAddToCart: () => void;
		onBuyNow: () => void;
	};

	let { onAddToCart, onBuyNow }: Props = $props();
</script>

<!-- Botones de acción -->
<div class="flex flex-col gap-3 pt-4 sm:flex-row">
	<button
		onclick={onAddToCart}
		class="flex-1 rounded-lg bg-[#FCA120] px-6 py-3 font-['Volkhov',serif] font-semibold text-[#262635] transition-colors hover:bg-[#e8931a] active:scale-[.98]"
	>
		Agregar al Carrito
	</button>

	<button
		onclick={onBuyNow}
		class="flex-1 rounded-lg bg-[#262635] px-6 py-3 font-['Volkhov',serif] font-semibold text-white transition-colors hover:bg-black active:scale-[.98]"
	>
		Comprar Ahora
	</button>
</div>
