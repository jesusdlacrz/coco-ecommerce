<script lang="ts">
	import { formatPrice } from '$lib/shared/utils/cartUtils';
	import type { Product } from '$lib/shared/model/products';

	type Props = { product: Product };
	let { product }: Props = $props();

	const displayPrice = $derived(product.wholesalePrice ?? product.price);
	const originalPrice = $derived(product.wholesalePrice ? product.price : null);
	const savingsPct = $derived(
		originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0
	);
</script>

<!-- Título con serif premium -->
<div>
	<h1 class="font-['Volkhov',serif] text-3xl font-bold text-[#262635]">{product.name}</h1>
	<p class="mt-1 font-['Jost',sans-serif] text-[#767676]">{product.description}</p>

	<!-- Estrellas + reseñas -->
	<div class="mt-2.5 flex items-center gap-2">
		<div class="flex">
			{#each [0, 1, 2, 3, 4] as i (i)}
				<svg
					class="h-4 w-4 {i < 4 ? 'text-[#262635]' : 'text-[#262635]/20'}"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
					/>
				</svg>
			{/each}
		</div>
		<span class="font-['Poppins',sans-serif] text-sm text-[#262635]">(12 reseñas de mayoristas)</span>
	</div>
</div>

<!-- Precios -->
<div class="space-y-1">
	<div class="flex flex-wrap items-center gap-3">
		<span class="text-3xl font-bold font-['Volkhov',serif] text-[#262635]">{formatPrice(displayPrice)}</span>
		{#if originalPrice}
			<span class="font-['Jost',sans-serif] text-lg text-[#a0a0a0] line-through"
				>{formatPrice(originalPrice)}</span
			>
			<span
				class="rounded-full bg-[#FCA120] px-2.5 py-0.5 font-['Poppins',sans-serif] text-xs font-semibold text-white"
			>
				AHORRAS {savingsPct}%
			</span>
		{/if}
	</div>
	<p class="font-['Jost',sans-serif]  text-sm text-[#767676]">
		SKU: {product.sku} • Stock: {product.stockQuantity}
	</p>
</div>
