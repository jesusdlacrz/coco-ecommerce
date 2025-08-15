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
	
	// Crear un mapa de colores únicos con sus hex values
	const uniqueColors = $derived(() => {
		const colorMap = new Map();
		products.forEach(product => {
			product.colors.forEach(color => {
				if (!colorMap.has(color.name)) {
					colorMap.set(color.name, color.hex);
				}
			});
		});
		return Array.from(colorMap.entries()).sort(([a], [b]) => a.localeCompare(b));
	});
	
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
				product.colors.some(color => selectedColors.includes(color.name));
			
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
			accent: 'bg-[#2C71CC] border-[#2C71CC] text-white',
			accentHover: 'hover:bg-[#2C71CC] hover:border-[#2C71CC]',
			checkboxAccent: 'text-[#16167F] focus:ring-[#16167F]',
			rangeAccent: 'accent-[#16167F]'
		},
		women: {
			accent: 'bg-[#B19ADE] border-[#B19ADE] text-white',
			accentHover: 'hover:bg-[#B19ADE] hover:border-[#B19ADE]',
			checkboxAccent: 'text-[#7C00F4] focus:ring-[#7C00F4]',
			rangeAccent: 'accent-[#7C00F4]'
		},
		boys: {
			accent: 'bg-[#2C71CC] border-[#2C71CC] text-white',
			accentHover: 'hover:bg-[#2C71CC] hover:border-[#2C71CC]',
			checkboxAccent: 'text-[#6297DB] focus:ring-[#6297DB]',
			rangeAccent: 'accent-[#2C71CC]'
		},
		girls: {
			accent: 'bg-[#FF91C1] border-[#FF91C1] text-white',
			accentHover: 'hover:bg-[#FF91C1] hover:border-[#FF91C1]',
			checkboxAccent: 'text-[#FF91C1] focus:ring-[#FF91C1]',
			rangeAccent: 'accent-[#FF91C1]'
		}
	};

	const currentStyle = $derived(categoryStyles[activeCategory]);
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

	<!-- Sizes Filter -->
	{#if allSizes.length > 0}
		<div class="mb-6">
			<h4 class="text-sm font-medium text-gray-900 mb-3">Tallas</h4>
			<div class="grid grid-cols-4 gap-2">
				{#each allSizes as size (size)}
					<button
						onclick={() => toggleSize(size)}
						class="px-2 py-2 text-sm border rounded-md transition-all {selectedSizes.includes(size) 
							? `${currentStyle.accent} ${currentStyle.accentHover}` 
							: 'border-gray-300 text-[#8A8A8A] hover:border-gray-400'}"
					>
						{size}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Colors Filter -->
	{#if uniqueColors().length > 0}
		<div class="mb-6">
			<h4 class="text-sm font-medium text-gray-900 mb-3">Colores</h4>
			<div class="grid grid-cols-6 gap-1">
				{#each uniqueColors() as [colorName, colorHex] (colorName)}
					<button
						onclick={() => toggleColor(colorName)}
						class="flex items-center justify-center p-1 rounded-lg transition-all hover:bg-gray-50 {selectedColors.includes(colorName) ? 'bg-gray-100' : ''}"
						title={colorName}
						aria-label={`Filtrar por color ${colorName}${selectedColors.includes(colorName) ? ' (seleccionado)' : ''}`}
					>
						<div 
							class="w-6 h-6 rounded-full border-2 transition-all {selectedColors.includes(colorName) 
								? 'border-gray-800 ring-2 ring-offset-2 ring-blue-500 shadow-md' 
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
