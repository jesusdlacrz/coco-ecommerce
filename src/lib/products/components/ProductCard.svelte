<script lang="ts">
	import type { Product } from '$lib/shared/model/products';
	import { categoryColors, type Category } from '$lib/shared/stores/categoryStore';

	interface Props {
		product: Product;
		currentCategory: Category;
		onProductClick: (productId: string) => void;
	}

	let { product, currentCategory, onProductClick }: Props = $props();

	const colors = $derived(categoryColors[currentCategory]);

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('es-CO', {
			style: 'currency',
			currency: 'COP',
			minimumFractionDigits: 0
		}).format(price);
	}

	function handleClick() {
		onProductClick(product.id);
	}
</script>

<div class="bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group" onclick={handleClick}>
	<!-- Product Image with Category Border -->
	<div class="relative aspect-square p-3">
		<div class="w-full h-full rounded-lg overflow-hidden border-4 {colors.border} transition-all duration-300 group-hover:scale-105">
			<img 
				src={product.images[0]} 
				alt={product.name}
				class="w-full h-full object-cover"
			/>
		</div>
		
		<!-- Stock indicator -->
		{#if !product.inStock}
			<div class="absolute top-5 left-5">
				<span class="bg-red-500 text-white px-2 py-1 text-xs rounded-full">
					Agotado
				</span>
			</div>
		{/if}
	</div>

	<!-- Product Info -->
	<div class="p-4 space-y-3">
		<!-- Product Name -->
		<h3 class="text-gray-900 font-medium text-sm line-clamp-2 group-hover:text-gray-700 transition-colors">
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
				<p class="text-xs text-gray-600 font-medium">Colores disponibles:</p>
				<div class="flex flex-wrap gap-1">
					{#each product.colors.slice(0, 4) as color (color)}
						<span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
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
			<span class="inline-block px-2 py-1 text-xs {colors.primary} text-white rounded-full">
				{product.category}
			</span>
			
			{#if product.minOrderQuantity}
				<span class="text-xs text-gray-500">
					Min. {product.minOrderQuantity} pzs
				</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
