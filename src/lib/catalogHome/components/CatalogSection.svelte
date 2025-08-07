<script lang="ts">
	import CatalogPreview from '$lib/catalogHome/components/CatalogPreview.svelte';
	import CategoryTabs from '$lib/catalogHome/components/CategoryTabs.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { sampleProducts } from '$lib/dataProducts/products';
	import { activeCategory, type Category } from '$lib/shared/stores/categoryStore';
	import { onMount } from 'svelte';

	// =================== STATE ===================
	let activeTab = $state<Category>('men');

	// =================== DERIVED DATA ===================
	const menProducts = sampleProducts.filter((p) => p.gender === 'men');
	const womenProducts = sampleProducts.filter((p) => p.gender === 'women');
	const boysProducts = sampleProducts.filter((p) => p.gender === 'boys');
	const girlsProducts = sampleProducts.filter((p) => p.gender === 'girls');

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
	onMount(() => {
		// Leer la categoría desde la URL al cargar la página
		const categoryParam = page.url.searchParams.get('category');
		if (categoryParam && ['men', 'women', 'boys', 'girls'].includes(categoryParam)) {
			activeTab = categoryParam as Category;
		}
	});

	// =================== UI HANDLERS ===================
	function handleTabChange(tab: Category) {
		console.log(`Switching to ${tab} tab`);
		activeTab = tab;
		activeCategory.set(tab);

		// Obtener la URL relativa actual con parámetros modificados
		const searchParams = new URLSearchParams(page.url.search);
		searchParams.set('category', tab);

		goto(`?${searchParams.toString()}`, {
			replaceState: true,
			noScroll: true
		});
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Page Header -->
	<div class="mb-8 text-center text-[#484848]">
		<h2 class="mb-4 text-3xl" style="">Catálogo Preview</h2>
		<p class="text-sm text-[#8A8A8A]">
			Vista previa de nuestros productos. Haz clic en cualquier producto para ver detalles
			completos.
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
	<CatalogPreview products={currentProducts} {activeTab} />
</div>
