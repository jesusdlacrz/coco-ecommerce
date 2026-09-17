<script lang="ts">
	import type { CategoryStyle } from '$lib/products/filters/categoryStyles';
	import type { DynamicPricePreset } from '$lib/products/filters/dynamicPrice';
	import CategoryFilter from './CategoryFilter.svelte';
	import SizeFilter from './SizeFilter.svelte';
	import ColorFilter from './ColorFilter.svelte';
	import PriceFilter from './PriceFilter.svelte';

	interface Props {
		currentStyle: CategoryStyle;
		categories: string[];
		categoryCounts: Record<string, number>;
		selectedCategories: string[];
		toggleCategory: (c: string) => void;
		sizes: string[];
		selectedSizes: string[];
		toggleSize: (s: string) => void;
		colors: [string, string][];
		selectedColors: string[];
		toggleColor: (c: string) => void;
		pricePresets: readonly DynamicPricePreset[];
		pricePresetCounts: Record<string, number>;
		activePreset: string | null;
		selectPreset: (id: string) => void;
		/** `touch` agranda los objetivos táctiles del panel móvil. */
		density?: 'compact' | 'touch';
	}

	let {
		currentStyle,
		categories,
		categoryCounts,
		selectedCategories,
		toggleCategory,
		sizes,
		selectedSizes,
		toggleSize,
		colors,
		selectedColors,
		toggleColor,
		pricePresets,
		pricePresetCounts,
		activePreset,
		selectPreset,
		density = 'compact'
	}: Props = $props();

	const touch = $derived(density === 'touch');
	// En móvil los círculos de color eran de 24px dentro de una celda estrecha:
	// por debajo del mínimo táctil recomendado (44px). Menos columnas = swatch
	// más grande y sin riesgo de tocar el color equivocado.
	const colorGrid = $derived(touch ? 'grid grid-cols-5 gap-2' : 'grid grid-cols-6 gap-1.5');
	const showSizes = $derived(selectedCategories.length > 0 && sizes.length > 0);
</script>

{#snippet section(title: string, body: import('svelte').Snippet)}
	<section class="border-t border-line-soft pt-5 first:border-t-0 first:pt-0">
		<h4 class="mb-3 font-display text-xs font-semibold tracking-[0.12em] text-muted uppercase">
			{title}
		</h4>
		{@render body()}
	</section>
{/snippet}

<div class="space-y-5">
	{#snippet categoriesBody()}
		<CategoryFilter
			{currentStyle}
			{categories}
			selected={selectedCategories}
			counts={categoryCounts}
			{toggleCategory}
			{touch}
		/>
	{/snippet}
	{@render section('Categorías', categoriesBody)}

	{#if showSizes}
		{#snippet sizesBody()}
			<SizeFilter {currentStyle} {sizes} {selectedSizes} {toggleSize} {touch} />
		{/snippet}
		{@render section('Tallas', sizesBody)}
	{/if}

	{#if colors.length > 0}
		{#snippet colorsBody()}
			<ColorFilter
				{currentStyle}
				{colors}
				{selectedColors}
				{toggleColor}
				{touch}
				containerClass={colorGrid}
			/>
		{/snippet}
		{@render section('Colores', colorsBody)}
	{/if}

	{#if pricePresets.length > 0}
		{#snippet priceBody()}
			<PriceFilter
				{currentStyle}
				presets={pricePresets}
				counts={pricePresetCounts}
				{activePreset}
				{selectPreset}
				{touch}
			/>
		{/snippet}
		{@render section('Precio', priceBody)}
	{/if}
</div>
