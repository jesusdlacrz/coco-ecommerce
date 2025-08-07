<script lang="ts">
	import type { Product } from '$lib/shared/model/products';
	import { categoryColors, type Category } from '$lib/shared/stores/categoryStore';
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';

	interface Props {
		product: Product;
		currentCategory: Category;
	}

	let { product, currentCategory }: Props = $props();

	const colors = $derived(categoryColors[currentCategory]);

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('es-CO', {
			style: 'currency',
			currency: 'COP',
			minimumFractionDigits: 0
		}).format(price);
	}
</script>

<TransitionLink
	href={`productos/${product.id}`}
	class="group cursor-pointer overflow-hidden rounded-lg bg-white transition-all duration-300 hover:shadow-lg"
>
	<!-- Product Image with Category Border -->
	<div class="relative aspect-square p-3">
		<div
			class="h-full w-full overflow-hidden rounded-lg border-4 {colors.border} transition-all duration-300 group-hover:scale-105"
		>
			<img
				src={product.images[0]}
				alt={product.name}
				class="h-full w-full object-cover"
				style="view-transition-name: image-{product.id};"
			/>
		</div>

		<!-- Stock indicator -->
		{#if !product.inStock}
			<div class="absolute top-5 left-5">
				<span class="rounded-full bg-red-500 px-2 py-1 text-xs text-white"> Agotado </span>
			</div>
		{/if}
	</div>

	<!-- Product Info -->
	<div class="space-y-3 p-4">
		<!-- Product Name -->
		<h3
			class="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-gray-700"
		>
			{product.name}
		</h3>

		<!-- Price -->
		<div class="flex items-center space-x-2">
			<span class="text-lg font-semibold text-gray-900">
				{formatPrice(product.price)}
			</span>
			{#if product.wholesalePrice}
				<span class="text-sm text-gray-500 line-through">
					{formatPrice(product.wholesalePrice)}
				</span>
			{/if}
		</div>

		<!-- Colors -->
		{#if product.colors && product.colors.length > 0}
			<div class="space-y-2">
				<p class="text-xs font-medium text-gray-600">Colores disponibles:</p>
				<div class="flex flex-wrap gap-1">
					{#each product.colors.slice(0, 4) as color (color)}
						<span class="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
							{color}
						</span>
					{/each}
					{#if product.colors.length > 4}
						<span class="inline-block px-2 py-1 text-xs {colors.light} {colors.text} rounded-full">
							+{product.colors.length - 4}
						</span>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Category badge -->
		<div class="flex items-center justify-between">
			<span class="inline-block px-2 py-1 text-xs {colors.primary} rounded-full text-white">
				{product.category}
			</span>

			{#if product.minOrderQuantity}
				<span class="text-xs text-gray-500">
					Min. {product.minOrderQuantity} pzs
				</span>
			{/if}
		</div>
	</div>
</TransitionLink>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		--webkit-line-clamp: 2;
		--webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
