<script lang="ts">
	import ProductPreview from '../../products/components/ProductCardPreview.svelte';
	import type { Product } from '$lib/shared/model/products';

	interface Props {
		products: Product[];
		activeTab: 'men' | 'women' | 'boys' | 'girls';
		onProductClick: (productId: string) => void;
	}

	let { products, activeTab, onProductClick }: Props = $props();

	// Limitar a máximo 6 productos
	const previewProducts = $derived(products.slice(0, 6));
</script>

<div class="space-y-6">
	<!-- Grid de productos preview -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
		{#each previewProducts as product (product.id)}
			<ProductPreview {product} {onProductClick} />
		{/each}
	</div>

	<!-- Botón para ver todos -->
	{#if products.length > 6}
		<div class="text-center pt-4">
			<a 
				href="/productos"
				class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
			>
				Ver todos los {products.length} productos
				<svg class="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
				</svg>
			</a>
		</div>
	{/if}
</div>
