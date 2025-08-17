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

	// Price presets
	const PRICE_PRESETS = [
		{ id: 'under200', label: 'Hasta $ 200.000', apply: () => ({ min: minPrice, max: 200000 }) },
		{ id: '200to300', label: '$200.000 a $300.000', apply: () => ({ min: 200000, max: 300000 }) },
		{ id: 'over300', label: 'Más de $300.000', apply: () => ({ min: 300000, max: maxPrice }) }
	] as const;
	let pricePreset = $state<string | null>(null);

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
			// deselect
			pricePreset = null;
			priceRange = { min: minPrice, max: maxPrice };
			return;
		}
		pricePreset = id;
		const preset = PRICE_PRESETS.find((p) => p.id === id);
		if (preset) {
			const r = preset.apply();
			priceRange = { min: r.min, max: r.max };
		}
	}

	// Counts for presets (respect other filters except price)
	const filteredExceptPrice = $derived(
		products.filter((p) => {
			const categoryMatch =
				selectedCategories.length === 0 || selectedCategories.includes(p.category);
			const sizeMatch =
				selectedCategories.length === 0 ||
				selectedSizes.length === 0 ||
				p.sizes.some((s) => selectedSizes.includes(s));
			const colorMatch =
				selectedColors.length === 0 || p.colors.some((c) => selectedColors.includes(c.name));
			return categoryMatch && sizeMatch && colorMatch;
		})
	);
	const pricePresetCounts = $derived({
		under200: filteredExceptPrice.filter((p) => p.price <= 200000).length,
		between200and300: filteredExceptPrice.filter((p) => p.price >= 200000 && p.price <= 300000)
			.length,
		over300: filteredExceptPrice.filter((p) => p.price >= 300000).length
	});

	// Category counts (aplican otros filtros excepto la propia selección de categoría)
	const filteredExceptCategory = $derived(
		products.filter((p) => {
			const sizeMatch =
				selectedSizes.length === 0 || p.sizes.some((s) => selectedSizes.includes(s));
			const colorMatch =
				selectedColors.length === 0 || p.colors.some((c) => selectedColors.includes(c.name));
			const priceMatch = p.price >= priceRange.min && p.price <= priceRange.max;
			return sizeMatch && colorMatch && priceMatch;
		})
	);
	const categoryCounts = $derived(
		Object.fromEntries(
			allCategories.map((cat) => [cat, filteredExceptCategory.filter((p) => p.category === cat).length])
		) as Record<string, number>
	);

	function pricePresetLabel(id: string | null): string | null {
		if (!id) return null;
		const p = PRICE_PRESETS.find((pr) => pr.id === id);
		return p ? p.label : null;
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
						<!-- Categories -->
						<div class="rounded-md border">
							<button
								type="button"
								onclick={() => toggleSection('categories')}
								class="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
							>
								<span>Categorías</span>
								<span
									class="transition-transform duration-200 {sectionsOpen.categories
										? 'rotate-90'
										: ''}">▶</span
								>
							</button>
							{#if sectionsOpen.categories}
								<div class="flex flex-col gap-1 px-3 pb-3">
									{#each allCategories as category (category)}
										<button
											onclick={() => toggleCategory(category)}
											style="font-family:'Poppins',sans-serif"
											class="rounded px-1 py-1 text-left text-sm transition {selectedCategories[0] ===
											category
												? `${currentStyle.textAccent} font-semibold`
												: 'text-gray-600 hover:text-gray-800'}">{category} <span class="text-gray-400">({categoryCounts[category] ?? 0})</span></button
										>
									{/each}
								</div>
							{/if}
						</div>
						<!-- Sizes -->
						{#if selectedCategories.length > 0 && availableSizes.length > 0}
							<div class="rounded-md border">
								<button
									type="button"
									onclick={() => toggleSection('sizes')}
									class="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
								>
									<span>Tallas</span>
									<span
										class="transition-transform duration-200 {sectionsOpen.sizes
											? 'rotate-90'
											: ''}">▶</span
									>
								</button>
								{#if sectionsOpen.sizes}
									<div class="grid grid-cols-4 gap-2 px-3 pb-3">
										{#each availableSizes as size (size)}
											<button
												onclick={() => toggleSize(size)}
												class="rounded-md border px-2 py-2 text-xs transition {selectedSizes.includes(
													size
												)
													? `${currentStyle.accent} ${currentStyle.accentHover}`
													: `${currentStyle.borderColor} text-[#8A8A8A] ${currentStyle.hoverBorderColor}`}"
												>{size}</button
											>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
						<!-- Colors -->
						{#if availableColors.length > 0}
							<div class="rounded-md border">
								<button
									type="button"
									onclick={() => toggleSection('colors')}
									class="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
								>
									<span>Colores</span>
									<span
										class="transition-transform duration-200 {sectionsOpen.colors
											? 'rotate-90'
											: ''}">▶</span
									>
								</button>
								{#if sectionsOpen.colors}
									<div class="grid grid-cols-6 gap-1 px-2 pb-3">
										{#each availableColors as [colorName, colorHex] (colorName)}
											<button
												onclick={() => toggleColor(colorName)}
												class="flex items-center justify-center rounded-lg p-1 transition hover:bg-gray-50 {selectedColors.includes(
													colorName
												)
													? 'bg-gray-100'
													: ''}"
												title={colorName}
												aria-label={`Filtrar por color ${colorName}${selectedColors.includes(colorName) ? ' (seleccionado)' : ''}`}
											>
												<div
													class="h-6 w-6 rounded-full border-2 transition {selectedColors.includes(
														colorName
													)
														? `border-transparent ring-2 ring-offset-2 ${currentStyle.ringColor}`
														: colorName === 'Blanco'
															? 'border-gray-300'
															: 'border-gray-200'}"
													style="background-color: {colorHex}"
												></div>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
						<!-- Price -->
						<div class="rounded-md border">
							<button
								type="button"
								onclick={() => toggleSection('price')}
								class="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
							>
								<span>Precio</span>
								<span
									class="transition-transform duration-200 {sectionsOpen.price ? 'rotate-90' : ''}"
									>▶</span
								>
							</button>
							{#if sectionsOpen.price}
								<div class="space-y-2 px-3 pb-4 text-sm">
									<div class="flex flex-col gap-1" style="font-family:'Poppins',sans-serif">
										<button
											class="rounded px-1 py-1 text-left {pricePreset === 'under200'
												? `${currentStyle.textAccent} font-semibold`
												: 'text-gray-600 hover:text-gray-800'}"
											onclick={() => selectPricePreset('under200')}
											>Hasta $ 200.000 <span class="text-gray-400"
												>({pricePresetCounts.under200})</span
											></button
										>
										<button
											class="rounded px-1 py-1 text-left {pricePreset === '200to300'
												? `${currentStyle.textAccent} font-semibold`
												: 'text-gray-600 hover:text-gray-800'}"
											onclick={() => selectPricePreset('200to300')}
											>$200.000 a $300.000 <span class="text-gray-400"
												>({pricePresetCounts.between200and300})</span
											></button
										>
										<button
											class="rounded px-1 py-1 text-left {pricePreset === 'over300'
												? `${currentStyle.textAccent} font-semibold`
												: 'text-gray-600 hover:text-gray-800'}"
											onclick={() => selectPricePreset('over300')}
											>Más de $300.000 <span class="text-gray-400"
												>({pricePresetCounts.over300})</span
											></button
										>
									</div>
									<div class="text-[11px] text-gray-500">
										Actual: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
									</div>
								</div>
							{/if}
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
		<div class="flex flex-col gap-1">
			{#each allCategories as category (category)}
				<button
					onclick={() => toggleCategory(category)}
					style="font-family:'Poppins',sans-serif"
					class="rounded py-1 text-left text-sm transition {selectedCategories[0] === category
						? `${currentStyle.textAccent} font-semibold`
						: `${currentStyle.textSecondary}`}">{category} <span style="font-family:'Poppins',sans-serif">({categoryCounts[category] ?? 0})</span></button
				>
			{/each}
		</div>
	</div>
	<!-- Sizes -->
	{#if selectedCategories.length > 0 && availableSizes.length > 0}
		<div class="mb-6">
			<h4 class="mb-3 text-sm font-medium text-gray-900">Tallas</h4>
			<div class="grid grid-cols-4 gap-2">
				{#each availableSizes as size (size)}
					<button
						onclick={() => toggleSize(size)}
						style="font-family:'Poppins',sans-serif"
						class="rounded-md border px-2 py-2 text-sm transition-all {selectedSizes.includes(size)
							? `${currentStyle.accent}`
							: `${currentStyle.borderColor} text-[#8A8A8A] ${currentStyle.accentHover} ${currentStyle.hoverBorderColor}`}"
						>{size}</button
					>
				{/each}
			</div>
		</div>
	{/if}
	<!-- Colors -->
	{#if availableColors.length > 0}
		<div class="mb-6">
			<h4 class="mb-3 text-sm font-medium text-gray-900">Colores</h4>
			<div class="grid grid-cols-8 gap-1">
				{#each availableColors as [colorName, colorHex] (colorName)}
					<button
						onclick={() => toggleColor(colorName)}
						class="flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 {selectedColors.includes(
							colorName
						)
							? 'bg-gray-100'
							: ''}"
						title={colorName}
						aria-label={`Filtrar por color ${colorName}${selectedColors.includes(colorName) ? ' (seleccionado)' : ''}`}
					>
						<div
							class="h-6 w-6 rounded-full border-2 transition-all {selectedColors.includes(
								colorName
							)
								? `border-transparent ring-2 ring-offset-2 ${currentStyle.ringColor}`
								: colorName === 'Blanco'
									? 'border-gray-300'
									: 'border-gray-200'}"
							style="background-color: {colorHex}"
						></div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
	<!-- Price -->
	<div class="mb-6">
		<h4 class="mb-3 text-sm font-medium text-gray-900">Precio</h4>
		<div class="space-y-2 text-sm">
			{#each PRICE_PRESETS as preset (preset.id)}
				{@const countMap = {
					under200: pricePresetCounts.under200,
					'200to300': pricePresetCounts.between200and300,
					over300: pricePresetCounts.over300
				}}
				<button
					style="font-family:'Poppins',sans-serif"
					class="rounded py-1 text-left {pricePreset === preset.id
						? `${currentStyle.textAccent} font-semibold`
						: `${currentStyle.textSecondary}`}"
					onclick={() => selectPricePreset(preset.id)}
					aria-pressed={pricePreset === preset.id}
				>
					<span style="font-family:'Poppins',sans-serif">
						{preset.label}
						<span class="ml-1 opacity-70" style="font-family:'Poppins',sans-serif">({countMap[preset.id]})</span>
					</span>
				</button>
			{/each}
		</div>
	</div>
	<!-- Active Filters Summary -->
	{#if selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || pricePreset}
		<div class="border-t border-[#16167F] pt-4">
			<h4 class="mb-2 text-sm font-medium text-gray-900">Filtros activos</h4>
			<div class="flex flex-wrap gap-2">
				{#each [...selectedCategories.map( (c) => ({ type: 'category', label: c, remove: () => toggleCategory(c) }) ), ...selectedSizes.map( (s) => ({ type: 'size', label: s, remove: () => toggleSize(s) }) ), ...selectedColors.map( (c) => ({ type: 'color', label: c, remove: () => toggleColor(c) }) ), ...(pricePreset ? [{ type: 'price', label: pricePresetLabel(pricePreset), remove: () => selectPricePreset(pricePreset!) }] : [])] as filter (filter.type + filter.label)}
					<span
						style="font-family:'Poppins',sans-serif"
						class="inline-flex items-center rounded-full px-2 py-1 text-xs {currentStyle.accent}"
					>
						{filter.label}
						<button
							onclick={filter.remove}
							class="ml-1 hover:text-gray-300"
							aria-label="Quitar filtro">×</button
						>
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>
