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
	import { formatPrice as formatPriceCOP } from '$lib/shared/utils/price';
	import { getCategoryStyle } from '$lib/products/filters/categoryStyles';
	// Dynamic price presets
	import {
		generateDynamicPricePresets,
		priceInPreset,
		applyDynamicPreset
	} from '$lib/products/filters/dynamicPrice';
	import {
		applyNonPriceFilters,
		productsExceptCategory,
		buildCategoryCounts
	} from '$lib/products/filters/logic';
	import Portal from '$lib/shared/components/Portal.svelte';
	import { registerOverlay } from '$lib/shared/services/overlays';
	import Button from '$lib/shared/components/form/Button.svelte';
	import FilterSections from './subFilters/FilterSections.svelte';
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

	let pricePreset = $state<string | null>(null);

	// Derived data (expressions directly for Svelte 5 $derived values)
	const allCategories = $derived(getAllCategories(products));
	const minPrice = $derived(getMinPrice(products));
	const maxPrice = $derived(getMaxPrice(products));

	// `priceRange` arranca en {0,0} y un $effect lo sincroniza con los límites
	// reales del catálogo. Mientras tanto filtraría todo hacia fuera, así que un
	// rango sin inicializar se trata como "sin filtro de precio" en vez de
	// depender del orden en que corran los efectos.
	const effectiveRange = $derived(
		priceRange.max > 0 ? priceRange : { min: minPrice, max: maxPrice }
	);

	// Dataset sin filtro de precio: sirve para generar los presets dinámicos y
	// para contar cuántos productos caen en cada uno.
	const filteredForCounts = $derived(
		applyNonPriceFilters(products, {
			selectedCategories,
			selectedSizes,
			selectedColors,
			priceRange: effectiveRange,
			pricePreset
		})
	);
	const dynamicPricePresets = $derived(
		generateDynamicPricePresets(
			filteredForCounts.map((p) => p.price),
			formatPriceCOP
		)
	);

	const availableSizes = $derived(getAvailableSizes(products, selectedCategories));
	const availableColors = $derived(getAvailableColors(products, selectedCategories, selectedSizes));
	const currentStyle = $derived(getCategoryStyle(activeCategory));
	const activeFiltersCount = $derived(
		selectedCategories.length + selectedSizes.length + selectedColors.length + (pricePreset ? 1 : 0)
	);

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

	// Los filtros se aplican en vivo; el resultado se deriva para poder mostrar
	// el conteo en el botón del panel móvil, donde la grilla queda tapada.
	const filteredProducts = $derived(
		applyAllFilters(products, {
			selectedCategories,
			selectedSizes,
			selectedColors,
			priceRange: effectiveRange
		})
	);

	$effect(() => {
		onFiltersChange(filteredProducts);
	});

	// Bloqueo de scroll compartido: antes esto actuaba sobre <html> y el visor
	// de imágenes sobre <body>, cada uno con su propio "valor previo".
	$effect(() => {
		if (showMobileFilters) return registerOverlay('filters');
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
		const preset = dynamicPricePresets.find((p) => p.id === id);
		if (preset) {
			const r = applyDynamicPreset(preset);
			priceRange = { min: r.min, max: r.max };
		}
	}

	function handleRangeChange(range: { min: number; max: number }) {
		pricePreset = null;
		priceRange = range;
	}

	// Counts using pure helpers
	// counts para presets dinámicos reutilizando filteredForCounts
	const pricePresetCounts = $derived(
		Object.fromEntries(
			dynamicPricePresets.map((pr) => [
				pr.id,
				filteredForCounts.filter((p) => priceInPreset(p.price, pr)).length
			])
		) as Record<string, number>
	);
	const filteredExceptCategory = $derived(
		productsExceptCategory(products, {
			selectedCategories,
			selectedSizes,
			selectedColors,
			priceRange: effectiveRange,
			pricePreset
		})
	);
	const categoryCounts = $derived(buildCategoryCounts(allCategories, filteredExceptCategory));
	const pricePresetLabel = (id: string | null) =>
		dynamicPricePresets.find((p) => p.id === id)?.label ?? null;

	const chips = $derived([
		...selectedCategories.map((c) => ({ label: c, remove: () => toggleCategory(c) })),
		...selectedSizes.map((s) => ({ label: s, remove: () => toggleSize(s) })),
		...selectedColors.map((c) => ({ label: c, remove: () => toggleColor(c) })),
		...(pricePreset
			? [{ label: pricePresetLabel(pricePreset)!, remove: () => selectPricePreset(pricePreset!) }]
			: [])
	]);

	// ensure active preset still valid when dynamic presets regenerate
	$effect(() => {
		if (pricePreset && !dynamicPricePresets.some((p) => p.id === pricePreset)) {
			pricePreset = null;
			priceRange = { min: minPrice, max: maxPrice };
		}
	});

	// Reset filters when the external activeCategory changes
	let prevCategory = activeCategory;
	$effect(() => {
		if (activeCategory !== prevCategory) {
			prevCategory = activeCategory;
			clearAllFilters();
		}
	});

	const resultCount = $derived(filteredProducts.length);

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

<!-- Disparador móvil + hoja inferior (bottom sheet).
     Antes era un cajón lateral de 320px de alto completo: el contenido ocupaba
     un tercio y dejaba dos tercios de blanco muerto. La hoja inferior se ajusta
     al contenido, queda al alcance del pulgar y deja ver la grilla detrás. -->
<div class="mb-4 lg:hidden">
	<button
		bind:this={triggerBtn}
		onclick={openMobile}
		class="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 font-display text-sm font-semibold text-ink shadow-sm transition active:scale-[.99]"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<path stroke-linecap="round" d="M4 6h16M7 12h10M10 18h4" />
		</svg>
		Filtros
		{#if activeFiltersCount > 0}
			<span
				class="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold {currentStyle.accent}"
				>{activeFiltersCount}</span
			>
		{/if}
	</button>

	{#if showMobileFilters}
		<Portal>
			<div
				class="fixed inset-0 z-[10000] flex flex-col justify-end"
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
					class="flex-1 bg-ink/40 backdrop-blur-[2px]"
					onclick={closeMobile}
				></button>

				<div
					id="drawer-filtros"
					tabindex="-1"
					class="flex max-h-[85vh] animate-[sheetUp_.28s_cubic-bezier(.32,.72,0,1)] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(38,38,53,0.22)] outline-none"
				>
					<div class="flex justify-center pt-3 pb-1">
						<span class="h-1 w-10 rounded-full bg-line" aria-hidden="true"></span>
					</div>

					<div class="flex items-center justify-between px-5 pt-1 pb-4">
						<h3 class="font-display text-xl font-semibold text-ink">Filtros</h3>
						<button
							onclick={closeMobile}
							class="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-graybrand/40 hover:text-ink"
							aria-label="Cerrar filtros"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
							</svg>
						</button>
					</div>

					{#if chips.length > 0}
						<div class="px-5 pb-4">
							<ActiveFiltersChips {currentStyle} {chips} clearAll={clearAllFilters} compact />
						</div>
					{/if}

					<div class="flex-1 overflow-y-auto px-5 pb-6">
						<FilterSections
							density="touch"
							{currentStyle}
							categories={allCategories}
							{categoryCounts}
							{selectedCategories}
							{toggleCategory}
							sizes={availableSizes}
							{selectedSizes}
							{toggleSize}
							colors={availableColors}
							{selectedColors}
							{toggleColor}
							pricePresets={dynamicPricePresets}
							{pricePresetCounts}
							activePreset={pricePreset}
							selectPreset={selectPricePreset}
							{minPrice}
							{maxPrice}
							{priceRange}
							onRangeChange={handleRangeChange}
						/>
					</div>

					<div
						class="flex gap-3 border-t border-line-soft bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
					>
						<Button
							variant="text"
							onclick={clearAllFilters}
							disabled={activeFiltersCount === 0}
							class="flex-1 border border-line"
						>
							Limpiar
						</Button>
						<!-- Los filtros ya se aplicaron en vivo: este botón cierra y, sobre
						     todo, dice cuántos productos quedaron sin tener que adivinar. -->
						<Button variant="secondary" onclick={closeMobile} class="flex-[1.6]">
							Ver {resultCount}
							{resultCount === 1 ? 'producto' : 'productos'}
						</Button>
					</div>
				</div>
			</div>
		</Portal>
	{/if}
</div>

<!-- Sidebar de escritorio -->
<aside class="hidden lg:block">
	<div class="mb-5 flex items-baseline justify-between border-b border-line pb-4">
		<h3 class="font-display text-xl font-semibold text-ink">Filtros</h3>
		{#if activeFiltersCount > 0}
			<button
				onclick={clearAllFilters}
				class="font-poppins text-xs text-muted-faint underline-offset-2 transition-colors hover:text-ink hover:underline"
			>
				Limpiar todo
			</button>
		{/if}
	</div>

	<FilterSections
		{currentStyle}
		categories={allCategories}
		{categoryCounts}
		{selectedCategories}
		{toggleCategory}
		sizes={availableSizes}
		{selectedSizes}
		{toggleSize}
		colors={availableColors}
		{selectedColors}
		{toggleColor}
		pricePresets={dynamicPricePresets}
		{pricePresetCounts}
		activePreset={pricePreset}
		selectPreset={selectPricePreset}
		{minPrice}
		{maxPrice}
		{priceRange}
		onRangeChange={handleRangeChange}
	/>

	<div class="mt-5">
		<ActiveFiltersChips {currentStyle} {chips} clearAll={clearAllFilters} />
	</div>
</aside>
