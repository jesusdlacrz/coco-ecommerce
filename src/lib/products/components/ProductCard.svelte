<script lang="ts">
	import type { Product } from '$lib/shared/model/products';
	import { categoryColors, type Category } from '$lib/shared/stores/categoryStore';
	import {
		displayPrice as getDisplayPrice,
		strikePrice,
		formatPrice
	} from '$lib/shared/utils/price';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';

	interface Props {
		product: Product;
		currentCategory: Category;
	}

	let { product, currentCategory }: Props = $props();

	const store = $derived(page.data.storefront ?? HOUSE_STORE);
	const colors = $derived(categoryColors[currentCategory]);

	const displayPrice = $derived(getDisplayPrice(product));
	const originalPrice = $derived(strikePrice(product));

	let selectedColor = $state(product.colors[0]?.name ?? '');

	function isWhite(color: { name: string; hex: string }): boolean {
		const h = color.hex.toUpperCase();
		return (
			h === '#FFFFFF' ||
			h === '#FFF' ||
			color.name.toLowerCase() === 'blanco' ||
			color.name.toLowerCase() === 'white'
		);
	}
</script>

<a
	href={`${store.basePath}/productos/${product.id}?category=${currentCategory}&from=productos`}
	class="group block cursor-pointer overflow-hidden transition-all duration-300"
>
	<!-- Image container -->
	<div class="relative aspect-[3/4] p-2">
		<div class="h-full w-full overflow-hidden rounded border-4 {colors.border}">
			<img
				src={product.images[0]}
				alt={product.name}
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
			/>
		</div>

		<!-- SOLD OUT badge — centered, circular -->
		{#if !product.inStock}
			<div class="absolute inset-0 m-2 flex items-center justify-center">
				<span
					class="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-center text-[10px] leading-tight font-semibold tracking-widest text-gray-600 uppercase shadow"
				>
					SOLD<br />OUT
				</span>
			</div>
		{/if}
	</div>

	<!-- Product info -->
	<div class="space-y-2 px-2 pt-1 pb-4">
		<!-- Name -->
		<h3
			class="product-name line-clamp-2 font-display text-sm font-medium text-ink transition-colors group-hover:text-gray-500"
		>
			{product.name}
		</h3>

		<!-- Price -->
		<div class="flex items-baseline gap-2">
			<span class="font-body text-base font-semibold text-ink">
				{formatPrice(displayPrice)}
			</span>
			{#if originalPrice}
				<span class="font-body text-sm text-muted-faint line-through">
					{formatPrice(originalPrice)}
				</span>
			{/if}
		</div>

		<!-- Color swatches -->
		{#if product.colors && product.colors.length > 0}
			<div class="flex flex-wrap items-center gap-1.5">
				{#each product.colors.slice(0, 6) as color (color.name)}
					<div
						class="h-5 w-5 cursor-pointer rounded-full transition-all duration-150
							{isWhite(color) ? 'border border-gray-300' : ''}"
						style="background-color: {color.hex};
							{selectedColor === color.name ? `box-shadow: 0 0 0 2px white, 0 0 0 3.5px ${color.hex};` : ''}"
						title={color.name}
						role="button"
						tabindex="0"
						onclick={(e) => {
							e.stopPropagation();
							selectedColor = color.name;
						}}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.stopPropagation();
								selectedColor = color.name;
							}
						}}
					></div>
				{/each}
				{#if product.colors.length > 6}
					<span
						class="inline-flex h-5 w-5 items-center justify-center text-[10px] font-medium {colors.text}"
					>
						+{product.colors.length - 6}
					</span>
				{/if}
			</div>
		{/if}

		<!-- Category badge -->
		<!-- <span class="inline-block rounded-full px-2.5 py-0.5 text-xs text-white {colors.primary}">
			{product.category}
		</span> -->
	</div>
</a>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
