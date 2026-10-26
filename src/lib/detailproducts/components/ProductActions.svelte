<script lang="ts">
	import Button from '$lib/shared/components/form/Button.svelte';

	type Props = {
		onAddToCart: () => void;
		onBuyNow: () => void;
		/** Producto agotado: la ficha se puede ver (ej. por un enlace viejo), pero no comprar. */
		soldOut?: boolean;
	};

	let { onAddToCart, onBuyNow, soldOut = false }: Props = $props();
</script>

<!-- Botones de acción -->
<div class="flex flex-col gap-3 pt-4 sm:flex-row">
	{#if soldOut}
		<Button disabled class="flex-1">Agotado</Button>
	{:else}
		<Button onclick={onAddToCart} class="flex-1">Agregar al Carrito</Button>
		<Button variant="secondary" onclick={onBuyNow} class="flex-1">Comprar Ahora</Button>
	{/if}
</div>
