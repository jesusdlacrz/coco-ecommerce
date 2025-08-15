<script lang="ts">
  import type { Product } from '$lib/shared/model/products';
  import { getAllCategories, getAvailableSizes, getAvailableColors, getMinPrice, getMaxPrice, applyAllFilters } from '$lib/products/filters/filterUtils';
  import { formatPriceCOP } from '$lib/products/filters/price';
  import { getCategoryStyle } from '$lib/products/filters/categoryStyles';

  interface Props {
    products: Product[];
    onFiltersChange: (filteredProducts: Product[]) => void;
    activeCategory: 'men' | 'women' | 'boys' | 'girls';
  }

  let { products, onFiltersChange, activeCategory }: Props = $props();

  // =================== FILTER STATE ===================
  let selectedSizes: string[] = $state([]);
  let selectedColors: string[] = $state([]);
  let selectedCategories: string[] = $state([]);
  let priceRange = $state({ min: 0, max: 1000000 });

  // =================== DERIVED DATA ===================
	const allCategories = $derived(getAllCategories(products));
	const availableSizes = $derived(getAvailableSizes(products, selectedCategories));
	const availableColors = $derived(getAvailableColors(products, selectedCategories, selectedSizes));
	const minPrice = $derived(getMinPrice(products));
	const maxPrice = $derived(getMaxPrice(products));
	const currentStyle = $derived(getCategoryStyle(activeCategory));

  // =================== EFFECTS ===================
  $effect(() => {
    selectedSizes = [];
    selectedColors = [];
    selectedCategories = [];
    priceRange = { min: minPrice, max: maxPrice };
  });

  $effect(() => {
    const filtered = applyAllFilters(products, { selectedCategories, selectedSizes, selectedColors, priceRange });
    onFiltersChange(filtered);
  });

  // =================== HANDLERS ===================
  function toggleSize(size: string) {
    if (selectedSizes.includes(size)) {
      selectedSizes = selectedSizes.filter(s => s !== size);
    } else {
      selectedSizes = [...selectedSizes, size];
    }
	const validColors = availableColors.map(([colorName]) => colorName);
    selectedColors = selectedColors.filter(color => validColors.includes(color));
  }

  function toggleColor(color: string) {
    if (selectedColors.includes(color)) {
      selectedColors = selectedColors.filter(c => c !== color);
    } else {
      selectedColors = [...selectedColors, color];
    }
  }

  function toggleCategory(category: string) {
    if (selectedCategories.includes(category)) {
      selectedCategories = selectedCategories.filter(c => c !== category);
    } else {
      selectedCategories = [...selectedCategories, category];
    }
    if (selectedCategories.length === 0) {
      selectedSizes = [];
      selectedColors = [];
    } else {
	const validSizes = availableSizes;
      selectedSizes = selectedSizes.filter(size => validSizes.includes(size));
	const validColors = availableColors.map(([colorName]) => colorName);
      selectedColors = selectedColors.filter(color => validColors.includes(color));
    }
  }

  function clearAllFilters() {
    selectedSizes = [];
    selectedColors = [];
    selectedCategories = [];
    priceRange = { min: minPrice, max: maxPrice };
  }

  const formatPrice = formatPriceCOP;
</script>

<div class="p-6 rounded-lg">
	<div class="flex items-center justify-between mb-6">
		<h3 class="text-lg font-semibold text-gray-900">Filtros</h3>
		<button
			onclick={clearAllFilters}
			class="text-sm {currentStyle.checkboxAccent} hover:underline"
		>
			Limpiar filtros
		</button>
	</div>

	<!-- Categories Filter -->
	{#if allCategories.length > 0}
		<div class="mb-6">
			<h4 class="text-sm font-medium text-gray-900 mb-3">Categorías</h4>
			<div class="grid grid-cols-2 gap-2">
				{#each allCategories as category (category)}
					<button
						onclick={() => toggleCategory(category)}
						class="px-3 py-2 text-sm border rounded-md transition-all text-left {selectedCategories.includes(category) 
							? `${currentStyle.accent} ${currentStyle.accentHover}` 
							: `${currentStyle.borderColor} text-[#8A8A8A] ${currentStyle.hoverBorderColor}`}"
					>
						{category}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Sizes Filter -->
	{#if selectedCategories.length > 0 && availableSizes.length > 0}
		<div class="mb-6">
			<h4 class="text-sm font-medium text-gray-900 mb-3">Tallas</h4>
			<div class="grid grid-cols-4 gap-2">
				{#each availableSizes as size (size)}
					<button
						onclick={() => toggleSize(size)}
						class="px-2 py-2 text-sm border rounded-md transition-all {selectedSizes.includes(size) 
							? `${currentStyle.accent} ${currentStyle.accentHover}` 
							: `${currentStyle.borderColor} text-[#8A8A8A] ${currentStyle.hoverBorderColor}`}"
					>
						{size}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Colors Filter -->
	{#if availableColors.length > 0}
		<div class="mb-6">
			<h4 class="text-sm font-medium text-gray-900 mb-3">Colores</h4>
			<div class="grid grid-cols-6 gap-1">
				{#each availableColors as [colorName, colorHex] (colorName)}
					<button
						onclick={() => toggleColor(colorName)}
						class="flex items-center justify-center p-1 rounded-lg transition-all hover:bg-gray-50 {selectedColors.includes(colorName) ? 'bg-gray-100' : ''}"
						title={colorName}
						aria-label={`Filtrar por color ${colorName}${selectedColors.includes(colorName) ? ' (seleccionado)' : ''}`}
					>
						<div 
							class="w-6 h-6 rounded-full border-2 transition-all {selectedColors.includes(colorName) 
								? `border-transparent ring-2 ring-offset-2 ${currentStyle.ringColor} ` 
								: colorName === 'Blanco' ? 'border-gray-300' : 'border-gray-200'}"
							style="background-color: {colorHex}"
						></div>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Price Filter -->
	<div class="mb-6">
		<h4 class="text-sm font-medium text-gray-900 mb-3">Rango de Precio</h4>
		<div class="space-y-3">
			<div>
				<label for="price-min" class="block text-xs text-gray-600 mb-1">Mínimo</label>
				<input
					id="price-min"
					type="range"
					min={minPrice}
					max={maxPrice}
					bind:value={priceRange.min}
					class="w-full h-2 {currentStyle.rangeAccent} rounded-lg appearance-none cursor-pointer"
				/>
				<div class="text-xs text-gray-600 mt-1">{formatPrice(priceRange.min)}</div>
			</div>
			<div>
				<label for="price-max" class="block text-xs text-gray-600 mb-1">Máximo</label>
				<input
					id="price-max"
					type="range"
					min={minPrice}
					max={maxPrice}
					bind:value={priceRange.max}
					class="w-full h-2 {currentStyle.rangeAccent} rounded-lg appearance-none cursor-pointer"
				/>
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
