<script lang="ts">
	import ProductCard from '$lib/products/components/ProductCard.svelte';
	import ProductFilters from '$lib/products/components/ProductFilters.svelte';
	import SimpleCategoryTabs from '$lib/products/components/CatalogCategoryTabs.svelte';
	import { goto } from '$app/navigation';

	import type { Product } from '$lib/shared/model/products';
	import { activeCategory, type Category } from '$lib/shared/stores/categoryStore';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';

	interface Props {
		products: Product[];
	}

	// =================== PROPS ===================
	let { products }: Props = $props();

	const store = $derived(page.data.storefront ?? HOUSE_STORE);

	// =================== STATE ===================
	// Detectar categoría inicial desde el query param antes del primer render para evitar parpadeo.
	const urlCategory = page.url.searchParams.get('category');
	const validCategories: Category[] = ['men', 'women', 'boys', 'girls'];
	const initialCategory: Category =
		urlCategory && validCategories.includes(urlCategory as Category)
			? (urlCategory as Category)
			: 'women'; // Solo default a 'women' si no viene categoría (caso botón Shop)

	// Sincronizar inmediatamente el store global
	activeCategory.set(initialCategory);

	let activeTab = $state<Category>(initialCategory);
	// No puede ser un $derived puro: currentProducts lo inicializa al cambiar de
	// categoría, pero ProductFilters también lo sobreescribe vía
	// handleFiltersChange — tiene dos fuentes de escritura.
	// eslint-disable-next-line svelte/prefer-writable-derived
	let filteredProducts = $state<Product[]>([]);

	// =================== DERIVED DATA ===================
	const menProducts = $derived(products.filter((p) => p.gender === 'men'));
	const womenProducts = $derived(products.filter((p) => p.gender === 'women'));
	const boysProducts = $derived(products.filter((p) => p.gender === 'boys'));
	const girlsProducts = $derived(products.filter((p) => p.gender === 'girls'));

	const currentProducts = $derived(
		activeTab === 'men'
			? menProducts
			: activeTab === 'women'
				? womenProducts
				: activeTab === 'boys'
					? boysProducts
					: girlsProducts
	);

	// =================== LIFECYCLE ===================
	// Initialize filtered products when current products change
	$effect(() => {
		filteredProducts = currentProducts;
	});

	// =================== UI HANDLERS ===================
	function handleTabChange(tab: Category) {
		activeTab = tab;

		// Update global category store
		activeCategory.set(tab);

		// Actualizar la URL con el query parameter
		const url = new URL(window.location.href);
		url.searchParams.set('category', tab);
		goto(url.toString(), { replaceState: true });
	}

	function handleFiltersChange(filtered: Product[]) {
		filteredProducts = filtered;
	}
</script>

<svelte:head>
	<title>Productos - {store.name}</title>
</svelte:head>

<div class="min-h-screen">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Category Tabs - Simplified for products page -->
		<SimpleCategoryTabs {activeTab} onTabChange={handleTabChange} />

		<!-- Main Content with Filters -->
		<div class="lg:grid lg:grid-cols-4 lg:gap-8">
			<!-- Filters Sidebar -->
			<div class="lg:col-span-1">
				<div class="sticky top-6">
					<ProductFilters
						products={currentProducts}
						activeCategory={activeTab}
						onFiltersChange={handleFiltersChange}
					/>
				</div>
			</div>

			<!-- Products Grid -->
			<div class="mt-6 lg:col-span-3 lg:mt-0">
				<div class="mb-4 text-sm text-gray-600">
					Mostrando {filteredProducts.length} de {currentProducts.length} productos
				</div>

				<div class="space-y-6">
					<!-- Grid de productos con tarjetas especializadas -->
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each filteredProducts as product (product.id)}
							<ProductCard {product} currentCategory={activeTab} />
						{/each}
					</div>

					{#if filteredProducts.length === 0}
						<div class="py-12 text-center">
							<p class="text-gray-500">No se encontraron productos con los filtros seleccionados</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
