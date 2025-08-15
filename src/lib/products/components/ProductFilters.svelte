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
	let selectedCategories: string[] = $state([]);
	let priceRange = $state({ min: 0, max: 1000000 });

	// =================== DERIVED DATA ===================
	const allCategories = $derived([...new Set(products.map(p => p.category))].sort());
	
	// Productos filtrados por categorías seleccionadas
	const productsFilteredByCategories = $derived(() => {
		if (selectedCategories.length === 0) return [];
		return products.filter(product => selectedCategories.includes(product.category));
	});
	
	// Tallas disponibles según categorías seleccionadas
	const availableSizes = $derived(() => {
		if (selectedCategories.length === 0) return [];
		return [...new Set(productsFilteredByCategories().flatMap(p => p.sizes))].sort();
	});
	
	// Productos filtrados por categorías y tallas
	const productsFilteredByCategoriesAndSizes = $derived(() => {
		let filtered = productsFilteredByCategories();
		if (selectedSizes.length > 0) {
			filtered = filtered.filter(product => 
				product.sizes.some(size => selectedSizes.includes(size))
			);
		}
		return filtered;
	});
	
	// Colores disponibles según filtros anteriores (categorías y tallas)
	const availableColors = $derived(() => {
		// Si no hay categorías seleccionadas, mostrar todos los colores
		let filtered = selectedCategories.length === 0 ? products : productsFilteredByCategoriesAndSizes();
		
		const colorMap = new Map();
		filtered.forEach(product => {
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
		// Reset filters when activeCategory changes
		selectedSizes = [];
		selectedColors = [];
		selectedCategories = [];
		priceRange = { min: minPrice, max: maxPrice };
	});

	$effect(() => {
		// Apply filters - este es el único efecto que debería ejecutarse para filtrar
		const filtered = products.filter(product => {
			// Category filter - si no hay categorías seleccionadas, mostrar todos
			const categoryMatch = selectedCategories.length === 0 || 
				selectedCategories.includes(product.category);
			
			// Size filter - solo aplicar si hay categorías seleccionadas
			const sizeMatch = selectedCategories.length === 0 || selectedSizes.length === 0 || 
				product.sizes.some(size => selectedSizes.includes(size));
			
			// Color filter - solo aplicar si hay filtros anteriores
			const colorMatch = selectedColors.length === 0 || 
				product.colors.some(color => selectedColors.includes(color.name));
			
			// Price filter
			const priceMatch = product.price >= priceRange.min && product.price <= priceRange.max;
			
			return categoryMatch && sizeMatch && colorMatch && priceMatch;
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
		
		// Limpiar colores que ya no están disponibles
		const validColors = availableColors().map(([colorName]) => colorName);
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
		
		// Limpiar tallas y colores que ya no están disponibles
		if (selectedCategories.length === 0) {
			selectedSizes = [];
			selectedColors = [];
		} else {
			const validSizes = availableSizes();
			selectedSizes = selectedSizes.filter(size => validSizes.includes(size));
			
			const validColors = availableColors().map(([colorName]) => colorName);
			selectedColors = selectedColors.filter(color => validColors.includes(color));
		}
	}

	function clearAllFilters() {
		selectedSizes = [];
		selectedColors = [];
		selectedCategories = [];
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
			rangeAccent: 'accent-[#16167F]',
			ringColor: 'ring-[#16167F]',
			borderColor: 'border-[#16167F]',
			hoverBorderColor: 'hover:border-[#0F0F5F]'
		},
		women: {
			accent: 'bg-[#B19ADE] border-[#B19ADE] text-white',
			accentHover: 'hover:bg-[#B19ADE] hover:border-[#B19ADE]',
			checkboxAccent: 'text-[#7C00F4] focus:ring-[#7C00F4]',
			rangeAccent: 'accent-[#7C00F4]',
			ringColor: 'ring-[#7C00F4]',
			borderColor: 'border-[#7C00F4]',
			hoverBorderColor: 'hover:border-[#5A00B8]'
		},
		boys: {
			accent: 'bg-[#2C71CC] border-[#2C71CC] text-white',
			accentHover: 'hover:bg-[#2C71CC] hover:border-[#2C71CC]',
			checkboxAccent: 'text-[#6297DB] focus:ring-[#6297DB]',
			rangeAccent: 'accent-[#2C71CC]',
			ringColor: 'ring-[#6297DB]',
			borderColor: 'border-[#6297DB]',
			hoverBorderColor: 'hover:border-[#4A7BC1]'
		},
		girls: {
			accent: 'bg-[#FF91C1] border-[#FF91C1] text-white',
			accentHover: 'hover:bg-[#FF91C1] hover:border-[#FF91C1]',
			checkboxAccent: 'text-[#FF91C1] focus:ring-[#FF91C1]',
			rangeAccent: 'accent-[#FF91C1]',
			ringColor: 'ring-[#FF91C1]',
			borderColor: 'border-[#FF91C1]',
			hoverBorderColor: 'hover:border-[#E5729A]'
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
	{#if selectedCategories.length > 0 && availableSizes().length > 0}
		<div class="mb-6">
			<h4 class="text-sm font-medium text-gray-900 mb-3">Tallas</h4>
			<div class="grid grid-cols-4 gap-2">
				{#each availableSizes() as size (size)}
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
	{#if availableColors().length > 0}
		<div class="mb-6">
			<h4 class="text-sm font-medium text-gray-900 mb-3">Colores</h4>
			<div class="grid grid-cols-6 gap-1">
				{#each availableColors() as [colorName, colorHex] (colorName)}
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
