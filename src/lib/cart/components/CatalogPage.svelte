<script lang="ts">
	import CartSummary from './CartSummary.svelte';
	import CategoryTabs from './CategoryTabs.svelte';
	import ProductGrid from './ProductGrid.svelte';
	import type { Product } from '$lib/types/products';

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
		onAddToCart: (product: Product, quantity: number, size: string | null, color: string | null) => void;
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
	<div class="mb-8">
		<h2 class="mb-2 text-3xl font-bold text-gray-900">Catálogo Mayorista</h2>
		<p class="text-gray-600">
			Precios especiales para mayoristas • Cantidades mínimas por producto
		</p>
		
		<!-- Cart Summary -->
		<CartSummary 
			{totalUnits} 
			{cartTotal} 
			{canProceedToPayment}
			{missingUnitsForPayment}
			{formatPrice} 
		/>
	</div>

	<!-- Category Tabs -->
	<CategoryTabs 
		{activeTab} 
		menProductsCount={menProducts.length}
		womenProductsCount={womenProducts.length}
		{onTabChange} 
	/>

	<!-- Product Grid -->
	<ProductGrid 
		products={currentProducts} 
		{activeTab} 
		{onAddToCart} 
	/>
</main>
