<script lang="ts">
	import ProductPreview from '$lib/products/components/ProductCardPreview.svelte';
	import type { Product } from '$lib/shared/model/products';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';

	interface Props {
		products: Product[];
		activeTab: 'men' | 'women' | 'boys' | 'girls';
	}

	let { products, activeTab }: Props = $props();

	const store = $derived(page.data.storefront ?? HOUSE_STORE);

	// Limitar a máximo 6 productos
	const previewProducts = $derived(products.slice(0, 6));
</script>

<section class="space-y-6">
	<div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-10 lg:grid-cols-3">
		{#each previewProducts as product (product.id)}
			<ProductPreview {product} category={activeTab} />
		{/each}
	</div>

	<div class="pt-6 text-center">
		<a
			href="{store.basePath}/productos?category={activeTab}"
			class="inline-flex items-center rounded-lg border border-transparent bg-black px-14 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-gray-800 hover:shadow-lg"
		>
			Ver Más
		</a>
	</div>
</section>
