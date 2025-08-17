<script lang="ts">
	import type { Product } from '$lib/shared/model/products';
	import type { PriceRange } from '$lib/products/filters/filterUtils';
	import {
		getAllCategories,
		getAvailableSizes,
		getAvailableColors,
		getMinPrice,
		getMaxPrice,
		applyAllFilters
	} from '$lib/products/filters/filterUtils';
	import { formatPriceCOP } from '$lib/products/filters/price';
	import { getCategoryStyle } from '$lib/products/filters/categoryStyles';
	// Dynamic price presets
	import { generateDynamicPricePresets, priceInPreset, applyDynamicPreset } from '$lib/products/filters/dynamicPrice';
	import { applyNonPriceFilters, productsExceptCategory, buildCategoryCounts } from '$lib/products/filters/logic';
	import Portal from '$lib/shared/components/Portal.svelte';
	import CategoryFilter from './subFilters/CategoryFilter.svelte';
	import SizeFilter from './subFilters/SizeFilter.svelte';
	import ColorFilter from './subFilters/ColorFilter.svelte';
	import PriceFilter from './subFilters/PriceFilter.svelte';
	import ActiveFiltersChips from './subFilters/ActiveFiltersChips.svelte';

	interface Props {
		products: Product[];
		onFiltersChange: (filteredProducts: Product[]) => void;
		activeCategory: 'men' | 'women' | 'boys' | 'girls';
	}

	let { products, onFiltersChange, activeCategory }: Props = $props();

	// State
	let selectedCategories = $state<string[]>([]);
	let selectedSizes = $state<string[]>([]);
	let selectedColors = $state<string[]>([]);
	let priceRange = $state<PriceRange>({ min: 0, max: 0 });
	let showMobileFilters = $state(false);
	let sectionsOpen = $state({ categories: true, sizes: true, colors: true, price: true });

	let pricePreset = $state<string | null>(null);
	// dynamic presets derived from current dataset (gender + optional category + other non-price filters basis)
	// base set for building presets should ignore price filtering but respect gender, category selection, sizes, colors.
	const baseForDynamicPresets = $derived(products.filter(p => {
		// gender already filtered by parent providing products (assumption)
		const categoryOk = selectedCategories.length === 0 || selectedCategories.includes(p.category);
		const sizeOk = selectedSizes.length === 0 || p.sizes.some(s=> selectedSizes.includes(s));
		const colorOk = selectedColors.length === 0 || p.colors.some(c=> selectedColors.includes(c.name));
		return categoryOk && sizeOk && colorOk;
	}));
	const dynamicPricePresets = $derived(generateDynamicPricePresets(baseForDynamicPresets.map(p=>p.price), formatPriceCOP));

	// Derived data (expressions directly for Svelte 5 $derived values)
	const allCategories = $derived(getAllCategories(products));
	const minPrice = $derived(getMinPrice(products));
	const maxPrice = $derived(getMaxPrice(products));
	const availableSizes = $derived(getAvailableSizes(products, selectedCategories));
	const availableColors = $derived(getAvailableColors(products, selectedCategories, selectedSizes));
	const currentStyle = $derived(getCategoryStyle(activeCategory));
	const activeFiltersCount = $derived(
		selectedCategories.length + selectedSizes.length + selectedColors.length + (pricePreset ? 1 : 0)
	);
	const formatPrice = formatPriceCOP;

	// Initialize / sync price range when bounds change
	$effect(() => {
		// If uninitialized (0,0) or dataset changed shrinking range
		if (
			(priceRange.min === 0 && priceRange.max === 0) ||
			priceRange.min < minPrice ||
			priceRange.max > maxPrice
		) {
			priceRange = { min: minPrice, max: maxPrice };
		}
	});

	// Apply filters
	$effect(() => {
		const filtered = applyAllFilters(products, {
			selectedCategories,
			selectedSizes,
			selectedColors,
			priceRange
		});
		onFiltersChange(filtered);
	});

	// Scroll lock when mobile drawer open
	$effect(() => {
		if (showMobileFilters) {
			const prev = document.documentElement.style.overflow;
			document.documentElement.style.overflow = 'hidden';
			return () => {
				document.documentElement.style.overflow = prev;
			};
		}
	});

	function toggleCategory(category: string) {
		// Single select logic
		selectedCategories = selectedCategories[0] === category ? [] : [category];
		// Clear dependent filters
		selectedSizes = [];
		selectedColors = [];
	}

	function toggleSize(size: string) {
		selectedSizes = selectedSizes.includes(size)
			? selectedSizes.filter((s) => s !== size)
			: [...selectedSizes, size];
		selectedColors = selectedColors.filter((c) => availableColors.some(([name]) => name === c));
	}

	function toggleColor(color: string) {
		selectedColors = selectedColors.includes(color)
			? selectedColors.filter((c) => c !== color)
			: [...selectedColors, color];
	}

	function clearAllFilters() {
		selectedCategories = [];
		selectedSizes = [];
		selectedColors = [];
		pricePreset = null;
		priceRange = { min: minPrice, max: maxPrice };
	}

	function selectPricePreset(id: string) {
		if (pricePreset === id) {
			pricePreset = null;
			priceRange = { min: minPrice, max: maxPrice };
			return;
		}
		pricePreset = id;
		const preset = dynamicPricePresets.find(p => p.id === id);
		if (preset) {
			const r = applyDynamicPreset(preset);
			priceRange = { min: r.min, max: r.max };
		}
	}

	// Counts using pure helpers
	const filteredExceptPrice = $derived(applyNonPriceFilters(products, { selectedCategories, selectedSizes, selectedColors, priceRange, pricePreset }));
	// counts for dynamic presets
	const pricePresetCounts = $derived(Object.fromEntries(dynamicPricePresets.map(pr => [pr.id, filteredExceptPrice.filter(p=> priceInPreset(p.price, pr)).length])) as Record<string, number>);
	const filteredExceptCategory = $derived(productsExceptCategory(products, { selectedCategories, selectedSizes, selectedColors, priceRange, pricePreset }));
	const categoryCounts = $derived(buildCategoryCounts(allCategories, filteredExceptCategory));
	const pricePresetLabel = (id: string | null) => dynamicPricePresets.find(p=>p.id===id)?.label ?? null;

	// ensure active preset still valid when dynamic presets regenerate
	$effect(() => {
		if (pricePreset && !dynamicPricePresets.some(p=>p.id===pricePreset)) {
			pricePreset = null;
			priceRange = { min: minPrice, max: maxPrice };
		}
	});

	function toggleSection(key: keyof typeof sectionsOpen) {
		sectionsOpen = { ...sectionsOpen, [key]: !sectionsOpen[key] };
	}

	// Reset filters when the external activeCategory changes
	let lastCategory = $state(activeCategory);
	$effect(() => {
		if (lastCategory !== activeCategory) {
			lastCategory = activeCategory;
			clearAllFilters();
		}
	});

	let triggerBtn: HTMLButtonElement | null = null;
	function openMobile() {
		showMobileFilters = true;
		// Focus first heading after mount
		requestAnimationFrame(() => {
			const el = document.getElementById('drawer-filtros');
			el?.focus();
		});
	}
	function closeMobile() {
		showMobileFilters = false;
		triggerBtn?.focus();
	}
</script>

<!-- Mobile Trigger + Drawer (Portal) -->
<div class="mb-4 lg:hidden">
	<button
		bind:this={triggerBtn}
		onclick={openMobile}
		class="flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-lg font-medium shadow transition active:scale-[.98]"
	>
		<span class={currentStyle.textAccent}>Filtros</span>
		{#if activeFiltersCount > 0}
			<span
				class="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs {currentStyle.accent}"
				>{activeFiltersCount}</span
			>
		{/if}
	</button>
	{#if showMobileFilters}
		<Portal>
			<div
				class="fixed inset-0 z-[10000] flex"
				aria-modal="true"
				role="dialog"
				tabindex="-1"
				aria-label="Filtros"
				onkeydown={(e) => {
					if (e.key === 'Escape') closeMobile();
				}}
			>
				<button
					type="button"
					aria-label="Cerrar filtros"
					class="flex-1 bg-black/40 backdrop-blur-[2px]"
					onclick={closeMobile}
				></button>
				<div
					id="drawer-filtros"
					tabindex="-1"
					class="flex h-full w-80 max-w-full animate-[slideIn_.25s_cubic-bezier(.4,0,.2,1)] flex-col overflow-hidden bg-white shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2"
				>
					<div class="flex items-center justify-between border-b px-4 py-3">
						<h3 class="text-base font-semibold">Filtros</h3>
						<div class="flex gap-2">
							{#if activeFiltersCount > 0}
								<button
									onclick={clearAllFilters}
									class="text-xs underline {currentStyle.textAccent}">Limpiar</button
								>
							{/if}
							<button
								onclick={closeMobile}
								class="rounded p-2 hover:bg-gray-100"
								aria-label="Cerrar">✕</button
							>
						</div>
					</div>
					<div class="flex-1 space-y-4 overflow-y-auto px-4 py-4">
						<div class="rounded-md border p-3">
							<CategoryFilter {currentStyle} categories={allCategories} selected={selectedCategories} counts={categoryCounts} {toggleCategory} />
						</div>
						{#if selectedCategories.length > 0 && availableSizes.length > 0}
							<div class="rounded-md border p-3">
								<SizeFilter {currentStyle} sizes={availableSizes} {selectedSizes} {toggleSize} />
							</div>
						{/if}
						{#if availableColors.length > 0}
							<div class="rounded-md border p-3">
								<ColorFilter {currentStyle} colors={availableColors} {selectedColors} {toggleColor} containerClass="grid grid-cols-6 gap-1" />
							</div>
						{/if}
						<div class="rounded-md border p-3">
							<PriceFilter currentStyle={currentStyle} presets={dynamicPricePresets} counts={pricePresetCounts} activePreset={pricePreset} selectPreset={selectPricePreset} />
						</div>
					</div>
					<div class="flex gap-2 border-t px-4 py-3">
						<button
							onclick={clearAllFilters}
							class="flex-1 rounded-md border px-3 py-2 text-sm {currentStyle.borderColor} bg-white"
							>Limpiar</button
						>
						<button
							onclick={closeMobile}
							class="flex-1 rounded-md px-3 py-2 text-sm {currentStyle.accent} {currentStyle.accentHover}"
							>Aplicar</button
						>
					</div>
				</div>
			</div>
		</Portal>
	{/if}
</div>

<!-- Desktop Filters -->
<div class="hidden lg:block">
	<!-- Desktop Heading -->
	<div class="mb-6 flex items-center justify-between">
		<h3 class="text-2xl font-semibold {currentStyle.textAccent}">Filtros</h3>
	</div>
	<!-- Categories -->
	<div class="mb-6">
		<h4 class="text-md mb-3 font-medium text-gray-900">Categorías</h4>
		<CategoryFilter {currentStyle} categories={allCategories} selected={selectedCategories} counts={categoryCounts} {toggleCategory} />
	</div>
	<!-- Sizes -->
	{#if selectedCategories.length > 0 && availableSizes.length > 0}
		<div class="mb-6">
			<h4 class="mb-3 text-sm font-medium text-gray-900">Tallas</h4>
			<SizeFilter {currentStyle} sizes={availableSizes} {selectedSizes} {toggleSize} />
		</div>
	{/if}
	<!-- Colors -->
	{#if availableColors.length > 0}
		<div class="mb-6">
			<h4 class="mb-3 text-sm font-medium text-gray-900">Colores</h4>
			<ColorFilter {currentStyle} colors={availableColors} {selectedColors} {toggleColor} containerClass="grid grid-cols-8 gap-1" />
		</div>
	{/if}
	<!-- Price -->
	<div class="mb-6">
		<h4 class="mb-3 text-sm font-medium text-gray-900">Precio</h4>
		<PriceFilter currentStyle={currentStyle} presets={dynamicPricePresets} counts={pricePresetCounts} activePreset={pricePreset} selectPreset={selectPricePreset} />
	</div>
	<!-- Active Filters Summary -->
	<ActiveFiltersChips {currentStyle} chips={[...selectedCategories.map(c=>({label:c,remove:()=>toggleCategory(c)})),...selectedSizes.map(s=>({label:s,remove:()=>toggleSize(s)})),...selectedColors.map(c=>({label:c,remove:()=>toggleColor(c)})),...(pricePreset? [{label: pricePresetLabel(pricePreset)!, remove:()=>selectPricePreset(pricePreset!)}]:[])]} />
</div>
