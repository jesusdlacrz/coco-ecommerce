<script lang="ts">
	import Button from '$lib/shared/components/form/Button.svelte';

	type Props = {
		onAddToCart: () => void;
		onBuyNow: () => void;
	};

	let { onAddToCart, onBuyNow }: Props = $props();
</script>

<!-- Botones de acción -->
<div class="flex flex-col gap-3 pt-4 sm:flex-row">
	<Button onclick={onAddToCart} class="flex-1">Agregar al Carrito</Button>
	<Button variant="secondary" onclick={onBuyNow} class="flex-1">Comprar Ahora</Button>
</div>
