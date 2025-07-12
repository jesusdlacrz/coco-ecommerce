<script lang="ts">
	interface Props {
		cartItemCount: number;
		cartTotal: number;
		formatPrice: (price: number) => string;
	}

	let { cartItemCount, cartTotal, formatPrice }: Props = $props();
</script>

{#if cartItemCount > 0}
	<div class="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
		<p class="text-green-800">
			<strong>{cartItemCount}</strong> productos en tu carrito • Total:
			<strong>{formatPrice(cartTotal)}</strong>
		</p>
	</div>
{/if}
