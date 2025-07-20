<script lang="ts">
	import CartSummary from './CartSummary.svelte';
	import CategoryTabs from './CategoryTabs.svelte';
	import ProductGrid from './ProductGrid.svelte';
	import type { Product } from '$lib/shared/model/products';

	interface Props {
		activeTab: 'men' | 'women';
		menProducts: Product[];
		womenProducts: Product[];
		totalUnits: number;
		cartTotal: number;
		canProceedToPayment: boolean;
		missingUnitsForPayment: number;
		formatPrice: (price: number) => string;
		onTabChange: (tab: 'men' | 'women') => void;
		onAddToCart: (
			product: Product,
			quantity: number,
			size: string | null,
			color: string | null
		) => void;
	}

	let {
		activeTab,
		menProducts,
		womenProducts,
		totalUnits,
		cartTotal,
		canProceedToPayment,
		missingUnitsForPayment,
		formatPrice,
		onTabChange,
		onAddToCart
	}: Props = $props();

	const currentProducts = $derived(activeTab === 'men' ? menProducts : womenProducts);
</script>

<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Page Header -->
	<div class="mb-8 text-center text-[#484848]">
		<h2 class="mb-4 text-3xl " style="font-family: 'Volkhov', serif;   font-weight: 400;
  font-style: normal;">Catálogo</h2>
		<p class="text-sm text-[#8A8A8A]">
			Precios especiales para mayoristas, minimo 4 unidades para completar compra.
		</p>
	</div>

	<!-- Category Tabs -->
	<CategoryTabs
		{activeTab}
		menProductsCount={menProducts.length}
		womenProductsCount={womenProducts.length}
		{onTabChange}
	/>

	<!-- Product Grid -->
	<ProductGrid products={currentProducts} {activeTab} {onAddToCart} />
</main>
