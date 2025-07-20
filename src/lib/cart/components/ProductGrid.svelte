<script lang="ts">
	import ProductCard from './ProductCard.svelte';
	import type { Product } from '$lib/shared/model/products';

	interface Props {
		products: Product[];
		activeTab: 'men' | 'women' | 'boys' | 'girls';
		onAddToCart: (
			product: Product,
			quantity: number,
			size: string | null,
			color: string | null
		) => void;
	}

	let { products, activeTab, onAddToCart }: Props = $props();

</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each products as product (product.id)}
			<ProductCard {product} {onAddToCart} />
		{/each}
	</div>
</div>
