<script lang="ts">
	import ProductPreview from '$lib/products/components/ProductCardPreview.svelte';
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
		activeTab = tab;
		
		// Actualizar la URL con el query parameter
		const url = new URL(window.location.href);
		url.searchParams.set('category', tab);
		goto(url.toString(), { replaceState: true });
	}

	function handleProductClick(productId: string) {
		// Mantener la categoría actual y marcar que viene de la página de productos
		goto(`/productos/${productId}?category=${activeTab}&from=productos`);
	}
</script>

<svelte:head>
	<title>Productos - Coco's</title>
</svelte:head>

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

	<!-- Category Tabs -->
	<CategoryTabs
		{activeTab}
		menProductsCount={menProducts.length}
		womenProductsCount={womenProducts.length}
		boysProductsCount={boysProducts.length}
		girlsProductsCount={girlsProducts.length}
		onTabChange={handleTabChange}
	/>

	<div class="space-y-6">
		<!-- Grid de productos - Todos los productos sin límite -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
			{#each currentProducts as product (product.id)}
				<ProductPreview {product} onProductClick={handleProductClick} />
			{/each}
		</div>

		{#if currentProducts.length === 0}
			<div class="text-center py-12">
				<p class="text-gray-500">No hay productos disponibles en esta categoría</p>
			</div>
		{/if}
	</div>
</div>
