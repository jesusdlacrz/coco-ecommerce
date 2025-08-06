<script lang="ts">
	import { formatPrice } from '$lib/shared/utils/cartUtils';
	import type { Product } from '$lib/shared/model/products';

	type Props = {
		product: Product;
	};

	let { product }: Props = $props();
</script>

<div>
	<span class="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full mb-2">
		{product.category}
	</span>
	<h1 class="text-3xl font-bold text-gray-900">{product.name}</h1>
	<p class="text-gray-600 mt-2">{product.description}</p>
</div>

<!-- Precios -->
<div class="space-y-2">
	<div class="flex items-center space-x-3">
		<span class="text-3xl font-bold text-gray-900">
			{formatPrice(product.wholesalePrice || product.price)}
		</span>
		{#if product.wholesalePrice}
			<span class="text-lg text-gray-500 line-through">
				{formatPrice(product.price)}
			</span>
		{/if}
	</div>
	<p class="text-sm text-gray-600">
		SKU: {product.sku} • Stock: {product.stockQuantity}
	</p>
</div>
