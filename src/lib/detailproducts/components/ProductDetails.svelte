<script lang="ts">
	import type { Product } from '$lib/shared/model/products';

	type Props = { product: Product };
	let { product }: Props = $props();

	// Static mockup: show urgency only when stock is reasonably low
	const showUrgency = $derived(product.stockQuantity <= 50);
	const pacasDisplay = $derived(Math.max(1, Math.min(5, Math.floor(product.stockQuantity / 10))));
	// Fill % for the progress bar (capped at ~30% to always feel urgent)
	const stockPct = $derived(Math.min(30, Math.round((product.stockQuantity / 100) * 30)));
</script>

<!-- Urgencia de stock -->
{#if showUrgency}
	<div class="border-t border-white/60 pt-5">
		<p class="mb-1.5 font-poppins text-sm font-medium text-danger">
			⚡ Solo quedan {pacasDisplay} pacas en stock
		</p>
		<div class="h-1.5 overflow-hidden rounded-full bg-gray-200">
			<div
				class="h-full rounded-full bg-accent transition-all"
				style="width: {stockPct}%"
			></div>
		</div>
	</div>
{/if}

<!-- Información adicional del producto -->
<div class="border-t border-white/60 pt-5 font-body  text-sm text-[#000000] space-y-2">
	<p><strong class="font-display">Disponibilidad:</strong> {product.inStock ? 'En stock' : 'Agotado'}</p>
</div>
