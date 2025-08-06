<script lang="ts">
	import ProductCard from '$lib/products/components/ProductCard.svelte';
	import ProductFilters from '$lib/products/components/ProductFilters.svelte';
	import SimpleCategoryTabs from '$lib/products/components/CatalogCategoryTabs.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { sampleProducts } from '$lib/dataProducts/products';
	import { activeCategory, type Category } from '$lib/shared/stores/categoryStore';
	import { onMount } from 'svelte';

	// =================== STATE ===================
	let activeTab = $state<Category>('men');
	let filteredProducts = $state<typeof sampleProducts>([]);

	// =================== DERIVED DATA ===================
	const menProducts = sampleProducts.filter((p) => p.gender === 'men');
	const womenProducts = sampleProducts.filter((p) => p.gender === 'women');
	const boysProducts = sampleProducts.filter((p) => p.gender === 'boys');
	const girlsProducts = sampleProducts.filter((p) => p.gender === 'girls');

	const currentProducts = $derived(
		activeTab === 'men' ? menProducts :
		activeTab === 'women' ? womenProducts :
		activeTab === 'boys' ? boysProducts :
		girlsProducts
	);

	// Background colors based on category
	const categoryBackgrounds = {
		men: 'bg-gradient-to-br from-blue-50 to-blue-100',
		women: 'bg-gradient-to-br from-pink-50 to-pink-100', 
		boys: 'bg-gradient-to-br from-green-50 to-green-100',
		girls: 'bg-gradient-to-br from-purple-50 to-purple-100'
	};

	const currentBackground = $derived(categoryBackgrounds[activeTab]);

	// =================== LIFECYCLE ===================
	onMount(() => {
		// Leer la categoría desde la URL al cargar la página
		const categoryParam = $page.url.searchParams.get('category');
		if (categoryParam && ['men', 'women', 'boys', 'girls'].includes(categoryParam)) {
			activeTab = categoryParam as Category;
		}
	});

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

	
	function handleFiltersChange(filtered: typeof sampleProducts) {
		filteredProducts = filtered;
	}
</script>

<svelte:head>
	<title>Productos - Coco's</title>
</svelte:head>

<div class="min-h-screen {currentBackground} transition-all duration-500">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Page Header -->
		<div class="mb-8 text-center text-[#484848]">
			<h2 class="mb-4 text-3xl" style="font-family: 'Volkhov', serif; font-weight: 400; font-style: normal;">
				Todos los Productos
			</h2>
			<p class="text-sm text-[#8A8A8A]">
				Explora toda nuestra colección. Haz clic en cualquier producto para ver detalles completos.
			</p>
		</div>

		<!-- Category Tabs - Simplified for products page -->
		<SimpleCategoryTabs
			{activeTab}
			onTabChange={handleTabChange}
		/>

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
			<div class="lg:col-span-3 mt-6 lg:mt-0">
				<div class="mb-4 text-sm text-gray-600">
					Mostrando {filteredProducts.length} de {currentProducts.length} productos
				</div>
				
				<div class="space-y-6">
					<!-- Grid de productos con tarjetas especializadas -->
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each filteredProducts as product (product.id)}
							<ProductCard 
								{product} 
								currentCategory={activeTab}
								
							/>
						{/each}
					</div>

					{#if filteredProducts.length === 0}
						<div class="text-center py-12">
							<p class="text-gray-500">No se encontraron productos con los filtros seleccionados</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
