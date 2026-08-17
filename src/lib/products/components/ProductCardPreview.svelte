<script lang="ts">
	import type { Product } from '$lib/shared/model/products';
	import { formatPrice, displayPrice } from '$lib/shared/utils/price';
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';

	interface Props {
		product: Product;
		category?: string;
	}

	let { product, category = '' }: Props = $props();

	const store = $derived(page.data.storefront ?? HOUSE_STORE);
	const isAlmostSoldOut = $derived(product.stockQuantity <= 20);
</script>

<TransitionLink
	href={`${store.basePath}/productos/${product.id}${category ? `?category=${category}&from=home` : ''}`}
	class="group w-full cursor-pointer rounded-lg bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
>
	<div class="p-4">
		<!-- Imagen del producto -->
		<div class="relative mb-3 aspect-square overflow-hidden rounded-md">
			<img
				src={product.images[0] || '/placeholder.svg'}
				alt={product.name}
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				loading="lazy"
				style="view-transition-name: image-{product.id};"
			/>
		</div>

		<!-- Información del producto -->
		<div class="space-y-2 text-left">
			<h3 class="text-md line-clamp-2 font-medium">
				{product.name}
			</h3>

			<div class="flex items-center justify-between">
				<span class="text-xl font-medium">
					{formatPrice(displayPrice(product))}
				</span>

				{#if isAlmostSoldOut}
					<span class="px-2 py-1 text-xs font-medium text-red-600"> Almost Sold Out </span>
				{/if}
			</div>
		</div>
	</div>
</TransitionLink>
