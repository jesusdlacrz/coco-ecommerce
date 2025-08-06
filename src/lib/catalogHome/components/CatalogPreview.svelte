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
	<div class="grid grid-cols-2 gap-4 md:gap-10 md:grid-cols-3 lg:grid-cols-3">
		{#each previewProducts as product (product.id)}
			<ProductPreview {product} {onProductClick} />
		{/each}
	</div>

	<!-- Botón para ver todos - Siempre mostrar -->
	<div class="text-center pt-6">
		<a 
			href="/productos?category={activeTab}"
			style="font-family: 'Poppins', serif;"
			class="inline-flex  items-center px-14 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg"
		>
			Ver Más
		</a>
	</div>
</div>
