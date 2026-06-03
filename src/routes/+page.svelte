<script lang="ts">
	import CatalogPreview from '$lib/catalogHome/components/CatalogPreview.svelte';
	import CategoryTabs from '$lib/catalogHome/components/CategoryTabs.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { sampleProducts } from '$lib/dataProducts/products';
	import { activeCategory, type Category } from '$lib/shared/stores/categoryStore';
	import { onMount } from 'svelte';

	// =================== STATE ===================
	let activeTab = $state<Category>('women');

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
		const categoryParam = $page.url.searchParams.get('category');
		if (categoryParam && ['men', 'women', 'boys', 'girls'].includes(categoryParam)) {
			activeTab = categoryParam as Category;
		}
	});

	// =================== UI HANDLERS ===================
	function handleTabChange(tab: Category) {
		activeTab = tab;
		activeCategory.set(tab);
		const url = new URL(window.location.href);
		url.searchParams.set('category', tab);
		goto(url.toString(), { replaceState: true });
	}

	function handleProductClick(productId: string) {
		goto(`/productos/${productId}?category=${activeTab}`);
	}
</script>

<svelte:head>
	<title>Coco's</title>
</svelte:head>

<section class="from-main relative min-h-screen overflow-hidden bg-gradient-to-t from-0% to-transparent to-30%">
	<CategoryTabs
		{activeTab}
		menProductsCount={menProducts.length}
		womenProductsCount={womenProducts.length}
		boysProductsCount={boysProducts.length}
		girlsProductsCount={girlsProducts.length}
		onTabChange={handleTabChange}
	/>
	<CatalogPreview products={currentProducts} activeTab={activeTab} />
</section>
