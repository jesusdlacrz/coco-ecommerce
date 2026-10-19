<script lang="ts">
	import type { Product } from '$lib/shared/model/products';

	type Props = { product: Product };
	let { product }: Props = $props();

	// Aviso de pocas unidades con el stock REAL (antes era un número inventado:
	// stock / 10 rotulado como "pacas", así 40 unidades decía "quedan 4").
	const LOW_STOCK = 20;
	const showUrgency = $derived(product.inStock && product.stockQuantity <= LOW_STOCK);
	const stockPct = $derived(Math.round((product.stockQuantity / LOW_STOCK) * 100));
</script>

<!-- Urgencia de stock -->
{#if showUrgency}
	<div class="border-t border-white/60 pt-5">
		<p class="mb-1.5 font-poppins text-sm font-medium text-danger">
			⚡ Solo quedan {product.stockQuantity}
			{product.stockQuantity === 1 ? 'unidad' : 'unidades'}
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
