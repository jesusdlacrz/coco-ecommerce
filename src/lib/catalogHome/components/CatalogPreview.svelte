<script lang="ts">
	import ProductPreview from '$lib/products/components/ProductCardPreview.svelte';
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';
	import type { Product } from '$lib/shared/model/products';

	interface Props {
		products: Product[];
		activeTab: 'men' | 'women' | 'boys' | 'girls';
	}

	let { products, activeTab }: Props = $props();

	// Limitar a máximo 6 productos
	const previewProducts = $derived(products.slice(0, 6));
</script>

<section class="space-y-6">
	<div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-10 lg:grid-cols-3">
		{#each previewProducts as product (product.id)}
			<ProductPreview {product} />
		{/each}
	</div>

	<div class="pt-6 text-center">
		<TransitionLink
			href="/productos?category={activeTab}"
			class="inline-flex items-center rounded-lg border border-transparent bg-black px-14 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-gray-800 hover:shadow-lg"
		>
			Ver Más
		</TransitionLink>
	</div>
</section>
