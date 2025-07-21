<script lang="ts">
	import CatalogPreview from '$lib/catalog/components/CatalogPreview.svelte';
	import CategoryTabs from '$lib/catalog/components/CategoryTabs.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { sampleProducts } from '$lib/data/products';
	import { onMount } from 'svelte';

	// =================== STATE ===================
	let activeTab = $state<'men' | 'women' | 'boys' | 'girls'>('men');

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

	// =================== LIFECYCLE ===================
	onMount(() => {
		// Leer la categoría desde la URL al cargar la página
		const categoryParam = $page.url.searchParams.get('category');
		if (categoryParam && ['men', 'women', 'boys', 'girls'].includes(categoryParam)) {
			activeTab = categoryParam as 'men' | 'women' | 'boys' | 'girls';
		}
	});

	// =================== UI HANDLERS ===================
	function handleTabChange(tab: 'men' | 'women' | 'boys' | 'girls') {
		console.log(`Switching to ${tab} tab`);
		activeTab = tab;
		
		// Actualizar la URL con el query parameter
		const url = new URL(window.location.href);
		url.searchParams.set('category', tab);
		goto(url.toString(), { replaceState: true });
	}

	function handleProductClick(productId: string) {
		// Mantener la categoría actual al navegar al detalle del producto
		goto(`/productos/${productId}?category=${activeTab}`);
	}
</script>

<svelte:head>
	<title>Coco's</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Page Header -->
	<div class="mb-8 text-center text-[#484848]">
		<h2 class="mb-4 text-3xl" style="font-family: 'Volkhov', serif; font-weight: 400; font-style: normal;">
			Catálogo
		</h2>
		<p class="text-sm text-[#8A8A8A]">
			Vista previa de nuestros productos. Haz clic en cualquier producto para ver detalles completos.
		</p>
	</div>

	<!-- Category Tabs -->
	<CategoryTabs
		{activeTab}
		menProductsCount={menProducts.length}
		womenProductsCount={womenProducts.length}
		boysProductsCount={boysProducts.length}
		girlsProductsCount={girlsProducts.length}
		onTabChange={handleTabChange}
	/>

	<!-- Catalog Preview -->
	<CatalogPreview 
		products={currentProducts}
		{activeTab}
		onProductClick={handleProductClick}
	/>
</div>
