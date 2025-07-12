<script lang="ts">
	import CartSummary from './CartSummary.svelte';
	import CategoryTabs from './CategoryTabs.svelte';
	import ProductGrid from './ProductGrid.svelte';
	import type { Product } from '$lib/types/products';

	interface Props {
		activeTab: 'men' | 'women';
		menProducts: Product[];
		womenProducts: Product[];
		cartItemCount: number;
		cartTotal: number;
		formatPrice: (price: number) => string;
		onTabChange: (tab: 'men' | 'women') => void;
		onAddToCart: (product: Product, quantity: number, size: string | null, color: string | null) => void;
	}

	let { 
		activeTab, 
		menProducts, 
		womenProducts, 
		cartItemCount, 
		cartTotal, 
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
		<CartSummary {cartItemCount} {cartTotal} {formatPrice} />
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
