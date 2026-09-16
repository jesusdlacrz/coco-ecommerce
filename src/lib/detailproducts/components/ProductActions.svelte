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
		class="flex-1 rounded-lg bg-accent px-6 py-3 font-display font-semibold text-ink transition-colors hover:bg-accent-hover active:scale-[.98]"
	>
		Agregar al Carrito
	</button>

	<button
		onclick={onBuyNow}
		class="flex-1 rounded-lg bg-ink px-6 py-3 font-display font-semibold text-white transition-colors hover:bg-black active:scale-[.98]"
	>
		Comprar Ahora
	</button>
</div>
