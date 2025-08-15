<script lang="ts">
	import type { Product } from '$lib/shared/model/products';
	import type { PriceRange } from '$lib/products/filters/filterUtils';
	import { getAllCategories, getAvailableSizes, getAvailableColors, getMinPrice, getMaxPrice, applyAllFilters } from '$lib/products/filters/filterUtils';
	import { formatPriceCOP } from '$lib/products/filters/price';
	import { getCategoryStyle } from '$lib/products/filters/categoryStyles';
	import Portal from '$lib/shared/components/Portal.svelte';

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

		// Derived data (expressions directly for Svelte 5 $derived values)
		const allCategories = $derived(getAllCategories(products));
		const minPrice = $derived(getMinPrice(products));
		const maxPrice = $derived(getMaxPrice(products));
		const availableSizes = $derived(getAvailableSizes(products, selectedCategories));
		const availableColors = $derived(getAvailableColors(products, selectedCategories, selectedSizes));
		const currentStyle = $derived(getCategoryStyle(activeCategory));
		const activeFiltersCount = $derived(selectedCategories.length + selectedSizes.length + selectedColors.length);
	const formatPrice = formatPriceCOP;

		// Initialize / sync price range when bounds change
		$effect(() => {
			// If uninitialized (0,0) or dataset changed shrinking range
			if ((priceRange.min === 0 && priceRange.max === 0) || priceRange.min < minPrice || priceRange.max > maxPrice) {
				priceRange = { min: minPrice, max: maxPrice };
			}
		});

	// Apply filters
	$effect(() => {
		const filtered = applyAllFilters(products, { selectedCategories, selectedSizes, selectedColors, priceRange });
		onFiltersChange(filtered);
	});

	// Scroll lock when mobile drawer open
	$effect(() => {
		if (showMobileFilters) {
			const prev = document.documentElement.style.overflow;
			document.documentElement.style.overflow = 'hidden';
			return () => { document.documentElement.style.overflow = prev; };
		}
	});

	function toggleCategory(category: string) {
		selectedCategories = selectedCategories.includes(category)
			? selectedCategories.filter(c => c !== category)
			: [...selectedCategories, category];
		// Clear dependent filters if categories changed
		selectedSizes = selectedSizes.filter(s => availableSizes.includes(s));
		selectedColors = selectedColors.filter(c => availableColors.some(([name]) => name === c));
	}

	function toggleSize(size: string) {
		selectedSizes = selectedSizes.includes(size)
			? selectedSizes.filter(s => s !== size)
			: [...selectedSizes, size];
		selectedColors = selectedColors.filter(c => availableColors.some(([name]) => name === c));
	}

	function toggleColor(color: string) {
		selectedColors = selectedColors.includes(color)
			? selectedColors.filter(c => c !== color)
			: [...selectedColors, color];
	}

	function clearAllFilters() {
		selectedCategories = [];
		selectedSizes = [];
		selectedColors = [];
		priceRange = { min: minPrice, max: maxPrice };
	}

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
<div class="md:hidden mb-4">
	<button bind:this={triggerBtn} onclick={openMobile} class="w-full flex gap-2 items-center justify-center px-4 py-3 text-lg font-medium rounded-md shadow  active:scale-[.98] transition">
		<span class="{currentStyle.textAccent}">Filtros</span>
		{#if activeFiltersCount > 0}
			<span class="inline-flex items-center justify-center min-w-6 h-6 px-2 text-xs rounded-full {currentStyle.accent}">{activeFiltersCount}</span>
		{/if}
	</button>
	{#if showMobileFilters}
		<Portal>
			<div class="fixed inset-0 z-[10000] flex" aria-modal="true" role="dialog" tabindex="-1" aria-label="Filtros" onkeydown={(e)=> { if(e.key==='Escape') closeMobile(); }}>
				<button type="button" aria-label="Cerrar filtros" class="flex-1 bg-black/40 backdrop-blur-[2px]" onclick={closeMobile}></button>
				<div id="drawer-filtros" tabindex="-1" class="w-80 max-w-full h-full bg-white shadow-2xl flex flex-col overflow-hidden outline-none animate-[slideIn_.25s_cubic-bezier(.4,0,.2,1)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40">
					<div class="flex items-center justify-between px-4 py-3 border-b">
						<h3 class="text-base font-semibold">Filtros</h3>
						<div class="flex gap-2">
							{#if activeFiltersCount > 0}
								<button onclick={clearAllFilters} class="text-xs underline {currentStyle.textAccent}">Limpiar</button>
							{/if}
							<button onclick={closeMobile} class="p-2 rounded hover:bg-gray-100" aria-label="Cerrar">✕</button>
						</div>
					</div>
					<div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
						<!-- Categories -->
						<div class="border rounded-md">
							<button type="button" onclick={() => toggleSection('categories')} class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium">
								<span>Categorías</span>
								<span class="transition-transform duration-200 {sectionsOpen.categories ? 'rotate-90' : ''}">▶</span>
							</button>
							{#if sectionsOpen.categories}
								<div class="px-3 pb-3 grid grid-cols-2 gap-2">
									{#each allCategories as category (category)}
										<button onclick={() => toggleCategory(category)} class="px-2 py-2 text-xs border rounded-md transition {selectedCategories.includes(category) ? `${currentStyle.accent} ${currentStyle.accentHover}` : `${currentStyle.borderColor} text-[#8A8A8A] ${currentStyle.hoverBorderColor}`}">{category}</button>
									{/each}
								</div>
							{/if}
						</div>
						<!-- Sizes -->
						{#if selectedCategories.length > 0 && availableSizes.length > 0}
							<div class="border rounded-md">
								<button type="button" onclick={() => toggleSection('sizes')} class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium">
									<span>Tallas</span>
									<span class="transition-transform duration-200 {sectionsOpen.sizes ? 'rotate-90' : ''}">▶</span>
								</button>
								{#if sectionsOpen.sizes}
									<div class="px-3 pb-3 grid grid-cols-4 gap-2">
										{#each availableSizes as size (size)}
											<button onclick={() => toggleSize(size)} class="px-2 py-2 text-xs border rounded-md transition {selectedSizes.includes(size) ? `${currentStyle.accent} ${currentStyle.accentHover}` : `${currentStyle.borderColor} text-[#8A8A8A] ${currentStyle.hoverBorderColor}`}">{size}</button>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
						<!-- Colors -->
						{#if availableColors.length > 0}
							<div class="border rounded-md">
								<button type="button" onclick={() => toggleSection('colors')} class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium">
									<span>Colores</span>
									<span class="transition-transform duration-200 {sectionsOpen.colors ? 'rotate-90' : ''}">▶</span>
								</button>
								{#if sectionsOpen.colors}
									<div class="px-2 pb-3 grid grid-cols-6 gap-1">
										{#each availableColors as [colorName, colorHex] (colorName)}
											<button onclick={() => toggleColor(colorName)} class="flex items-center justify-center p-1 rounded-lg transition hover:bg-gray-50 {selectedColors.includes(colorName) ? 'bg-gray-100' : ''}" title={colorName} aria-label={`Filtrar por color ${colorName}${selectedColors.includes(colorName) ? ' (seleccionado)' : ''}`}>
												<div class="w-6 h-6 rounded-full border-2 transition {selectedColors.includes(colorName) ? `border-transparent ring-2 ring-offset-2 ${currentStyle.ringColor}` : colorName === 'Blanco' ? 'border-gray-300' : 'border-gray-200'}" style="background-color: {colorHex}"></div>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
						<!-- Price -->
						<div class="border rounded-md">
							<button type="button" onclick={() => toggleSection('price')} class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium">
								<span>Precio</span>
								<span class="transition-transform duration-200 {sectionsOpen.price ? 'rotate-90' : ''}">▶</span>
							</button>
							{#if sectionsOpen.price}
								<div class="px-3 pb-4 space-y-4">
									<div>
										<label for="m-price-min" class="block text-xs text-gray-600 mb-1">Mínimo</label>
										<input id="m-price-min" type="range" min={minPrice} max={maxPrice} bind:value={priceRange.min} class="w-full h-2 {currentStyle.rangeAccent} rounded-lg appearance-none cursor-pointer" />
										<div class="text-xs text-gray-600 mt-1">{formatPrice(priceRange.min)}</div>
									</div>
									<div>
										<label for="m-price-max" class="block text-xs text-gray-600 mb-1">Máximo</label>
										<input id="m-price-max" type="range" min={minPrice} max={maxPrice} bind:value={priceRange.max} class="w-full h-2 {currentStyle.rangeAccent} rounded-lg appearance-none cursor-pointer" />
										<div class="text-xs text-gray-600 mt-1">{formatPrice(priceRange.max)}</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
					<div class="px-4 py-3 border-t flex gap-2">
						<button onclick={clearAllFilters} class="flex-1 text-sm px-3 py-2 rounded-md border {currentStyle.borderColor} bg-white">Limpiar</button>
						<button onclick={closeMobile} class="flex-1 text-sm px-3 py-2 rounded-md {currentStyle.accent} {currentStyle.accentHover}">Aplicar</button>
					</div>
				</div>
			</div>
		</Portal>
	{/if}
</div>

<!-- Desktop Filters -->
<div class="hidden md:block">
	<!-- Desktop Heading -->
	<div class="mb-6 flex items-center justify-between">
		<h3 class="text-xl font-semibold {currentStyle.textAccent}">Filtros</h3>
	</div>
	<!-- Categories -->
	<div class="mb-6">
		<h4 class="text-sm font-medium text-gray-900 mb-3">Categorías</h4>
		<div class="grid grid-cols-2 gap-2">
			{#each allCategories as category (category)}
				<button onclick={() => toggleCategory(category)} class="px-2 py-2 text-xs border rounded-md transition {selectedCategories.includes(category) ? `${currentStyle.accent} ${currentStyle.accentHover}` : `${currentStyle.borderColor} text-[#8A8A8A] ${currentStyle.hoverBorderColor}`}">{category}</button>
			{/each}
		</div>
	</div>
	<!-- Sizes -->
	{#if selectedCategories.length > 0 && availableSizes.length > 0}
		<div class="mb-6">
			<h4 class="text-sm font-medium text-gray-900 mb-3">Tallas</h4>
			<div class="grid grid-cols-4 gap-2">
				{#each availableSizes as size (size)}
					<button onclick={() => toggleSize(size)} class="px-2 py-2 text-sm border rounded-md transition-all {selectedSizes.includes(size) ? `${currentStyle.accent} ${currentStyle.accentHover}` : `${currentStyle.borderColor} text-[#8A8A8A] ${currentStyle.hoverBorderColor}`}">{size}</button>
				{/each}
			</div>
		</div>
	{/if}
	<!-- Colors -->
	{#if availableColors.length > 0}
		<div class="mb-6">
			<h4 class="text-sm font-medium text-gray-900 mb-3">Colores</h4>
			<div class="grid grid-cols-6 gap-1">
				{#each availableColors as [colorName, colorHex] (colorName)}
					<button onclick={() => toggleColor(colorName)} class="flex items-center justify-center p-1 rounded-lg transition-all hover:bg-gray-50 {selectedColors.includes(colorName) ? 'bg-gray-100' : ''}" title={colorName} aria-label={`Filtrar por color ${colorName}${selectedColors.includes(colorName) ? ' (seleccionado)' : ''}`}>
						<div class="w-6 h-6 rounded-full border-2 transition-all {selectedColors.includes(colorName) ? `border-transparent ring-2 ring-offset-2 ${currentStyle.ringColor}` : colorName === 'Blanco' ? 'border-gray-300' : 'border-gray-200'}" style="background-color: {colorHex}"></div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
	<!-- Price -->
	<div class="mb-6">
		<h4 class="text-sm font-medium text-gray-900 mb-3">Rango de Precio</h4>
		<div class="space-y-3">
			<div>
				<label for="price-min" class="block text-xs text-gray-600 mb-1">Mínimo</label>
				<input id="price-min" type="range" min={minPrice} max={maxPrice} bind:value={priceRange.min} class="w-full h-2 {currentStyle.rangeAccent} rounded-lg appearance-none cursor-pointer" />
				<div class="text-xs text-gray-600 mt-1">{formatPrice(priceRange.min)}</div>
			</div>
			<div>
				<label for="price-max" class="block text-xs text-gray-600 mb-1">Máximo</label>
				<input id="price-max" type="range" min={minPrice} max={maxPrice} bind:value={priceRange.max} class="w-full h-2 {currentStyle.rangeAccent} rounded-lg appearance-none cursor-pointer" />
				<div class="text-xs text-gray-600 mt-1">{formatPrice(priceRange.max)}</div>
			</div>
		</div>
	</div>
	<!-- Active Filters Summary -->
	{#if selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0}
		<div class="pt-4 border-t">
			<h4 class="text-sm font-medium text-gray-900 mb-2">Filtros activos</h4>
			<div class="flex flex-wrap gap-2">
				{#each selectedCategories as category (category)}
					<span class="inline-flex items-center px-2 py-1 rounded-full text-xs {currentStyle.accent}">
						{category}
						<button onclick={() => toggleCategory(category)} class="ml-1 hover:text-gray-300">×</button>
					</span>
				{/each}
				{#each selectedSizes as size (size)}
					<span class="inline-flex items-center px-2 py-1 rounded-full text-xs {currentStyle.accent}">
						{size}
						<button onclick={() => toggleSize(size)} class="ml-1 hover:text-gray-300">×</button>
					</span>
				{/each}
				{#each selectedColors as color (color)}
					<span class="inline-flex items-center px-2 py-1 rounded-full text-xs {currentStyle.accent}">
						{color}
						<button onclick={() => toggleColor(color)} class="ml-1 hover:text-gray-300">×</button>
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>
