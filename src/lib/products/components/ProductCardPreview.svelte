<script lang="ts">
	import type { Product } from '$lib/shared/model/products';
	import { formatPrice } from '$lib/shared/utils/cartUtils';

	interface Props {
		product: Product;
		onProductClick: (productId: string) => void;
	}

	let { product, onProductClick }: Props = $props();

	// Determinar si mostrar "Almost Sold Out" basado en stock
	const isAlmostSoldOut = $derived(product.stockQuantity <= 20);
</script>

<button
	onclick={() => onProductClick(product.id)}
	class="group w-full rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
>
	<div class="p-4">
		<!-- Imagen del producto -->
		<div class="relative mb-3 aspect-square overflow-hidden rounded-md">
			<img
				src={product.images[0] || '/placeholder.svg'}
				alt={product.name}
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				loading="lazy"
			/>
		</div>

		<!-- Información del producto -->
		<div class="space-y-2 text-left">
			<h3 class="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
				{product.name}
			</h3>
			
			<div class="flex items-center justify-between">
				<span class="text-lg font-bold text-gray-900">
					{formatPrice(product.wholesalePrice || product.price)}
				</span>
				
				{#if isAlmostSoldOut}
					<span class="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
						Almost Sold Out
					</span>
				{/if}
			</div>
		</div>
	</div>
</button>
