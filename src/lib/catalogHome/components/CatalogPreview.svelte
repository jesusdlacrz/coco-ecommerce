<script lang="ts">
	import Button from '$lib/shared/components/form/Button.svelte';
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
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-10">
		{#each previewProducts as product (product.id)}
			<ProductPreview {product} category={activeTab} />
		{/each}
	</div>

	<div class="pt-6 text-center">
		<Button variant="secondary" href="{store.basePath}/productos?category={activeTab}" class="px-14">
			Ver Más
		</Button>
	</div>
</section>
