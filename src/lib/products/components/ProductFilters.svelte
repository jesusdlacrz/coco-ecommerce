<script lang="ts">
	import type { Product } from '$lib/shared/model/products';

	interface Props {
		products: Product[];
		onFiltersChange: (filteredProducts: Product[]) => void;
		activeCategory: 'men' | 'women' | 'boys' | 'girls';
	}

	let { products, onFiltersChange, activeCategory }: Props = $props();

	// =================== FILTER STATE ===================
	let selectedSizes: string[] = $state([]);
	let selectedColors: string[] = $state([]);
	let priceRange = $state({ min: 0, max: 1000000 });

	// =================== DERIVED DATA ===================
	const allSizes = $derived([...new Set(products.flatMap(p => p.sizes))].sort());
	const allColors = $derived([...new Set(products.flatMap(p => p.colors))].sort());
	const minPrice = $derived(Math.min(...products.map(p => p.price)));
	const maxPrice = $derived(Math.max(...products.map(p => p.price)));

	// =================== EFFECTS ===================
	$effect(() => {
		// Reset filters when category changes
		selectedSizes = [];
		selectedColors = [];
		priceRange = { min: minPrice, max: maxPrice };
	});

	$effect(() => {
		// Apply filters
		const filtered = products.filter(product => {
			// Size filter
			const sizeMatch = selectedSizes.length === 0 || 
				product.sizes.some(size => selectedSizes.includes(size));
			
			// Color filter
			const colorMatch = selectedColors.length === 0 || 
				product.colors.some(color => selectedColors.includes(color));
			
			// Price filter
			const priceMatch = product.price >= priceRange.min && product.price <= priceRange.max;
			
			return sizeMatch && colorMatch && priceMatch;
		});
		
		onFiltersChange(filtered);
	});

	// =================== HANDLERS ===================
	function toggleSize(size: string) {
		if (selectedSizes.includes(size)) {
			selectedSizes = selectedSizes.filter(s => s !== size);
		} else {
			selectedSizes = [...selectedSizes, size];
		}
	}

	function toggleColor(color: string) {
		if (selectedColors.includes(color)) {
			selectedColors = selectedColors.filter(c => c !== color);
		} else {
			selectedColors = [...selectedColors, color];
		}
	}

	function clearAllFilters() {
		selectedSizes = [];
		selectedColors = [];
		priceRange = { min: minPrice, max: maxPrice };
	}

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('es-CO', {
			style: 'currency',
			currency: 'COP',
			minimumFractionDigits: 0
		}).format(price);
	}

	// Category-specific styles
	const categoryStyles = {
		men: {
			accent: 'bg-blue-600 border-blue-600 text-white',
			accentHover: 'hover:bg-blue-700 hover:border-blue-700',
			checkboxAccent: 'text-blue-600 focus:ring-blue-500',
			rangeAccent: 'accent-blue-600'
		},
		women: {
			accent: 'bg-pink-600 border-pink-600 text-white',
			accentHover: 'hover:bg-pink-700 hover:border-pink-700',
			checkboxAccent: 'text-pink-600 focus:ring-pink-500',
			rangeAccent: 'accent-pink-600'
		},
		boys: {
			accent: 'bg-green-600 border-green-600 text-white',
			accentHover: 'hover:bg-green-700 hover:border-green-700',
			checkboxAccent: 'text-green-600 focus:ring-green-500',
			rangeAccent: 'accent-green-600'
		},
		girls: {
			accent: 'bg-purple-600 border-purple-600 text-white',
			accentHover: 'hover:bg-purple-700 hover:border-purple-700',
			checkboxAccent: 'text-purple-600 focus:ring-purple-500',
			rangeAccent: 'accent-purple-600'
		}
	};

	const currentStyle = $derived(categoryStyles[activeCategory]);
</script>

<div class="bg-white p-6 rounded-lg shadow-sm border">
	<div class="flex items-center justify-between mb-6">
		<h3 class="text-lg font-semibold text-gray-900">Filtros</h3>
		<button
			onclick={clearAllFilters}
			class="text-sm {currentStyle.checkboxAccent} hover:underline"
		>
			Limpiar filtros
		</button>
	</div>

	<!-- Sizes Filter -->
	{#if allSizes.length > 0}
		<div class="mb-6">
			<h4 class="text-sm font-medium text-gray-900 mb-3">Tallas</h4>
			<div class="grid grid-cols-3 gap-2">
				{#each allSizes as size (size)}
					<button
						onclick={() => toggleSize(size)}
						class="px-3 py-2 text-sm border rounded-md transition-all {selectedSizes.includes(size) 
							? `${currentStyle.accent} ${currentStyle.accentHover}` 
							: 'border-gray-300 text-gray-700 hover:border-gray-400'}"
					>
						{size}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Colors Filter -->
	{#if allColors.length > 0}
		<div class="mb-6">
			<h4 class="text-sm font-medium text-gray-900 mb-3">Colores</h4>
			<div class="space-y-2">
				{#each allColors as color (color)}
					<label class="flex items-center">
						<input
							type="checkbox"
							checked={selectedColors.includes(color)}
							onchange={() => toggleColor(color)}
							class="rounded border-gray-300 {currentStyle.checkboxAccent}"
						/>
						<span class="ml-2 text-sm text-gray-700">{color}</span>
					</label>
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
	{#if selectedSizes.length > 0 || selectedColors.length > 0}
		<div class="pt-4 border-t">
			<h4 class="text-sm font-medium text-gray-900 mb-2">Filtros activos</h4>
			<div class="flex flex-wrap gap-2">
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
