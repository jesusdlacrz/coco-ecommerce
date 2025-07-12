<script lang="ts">
	import ProductCard from './ProductCard.svelte';
	import type { Product } from '$lib/types/products';

	interface Props {
		products: Product[];
		activeTab: 'men' | 'women';
		onAddToCart: (product: Product, quantity: number, size: string | null, color: string | null) => void;
	}

	let { products, activeTab, onAddToCart }: Props = $props();

	const tabConfig = {
		men: {
			title: 'Sección Masculina',
			description: 'Ropa formal y casual para hombres con precios mayoristas especiales',
			borderColor: 'border-blue-200',
			bgColor: 'bg-blue-50',
			titleColor: 'text-blue-900',
			descColor: 'text-blue-700'
		},
		women: {
			title: 'Sección Femenina',
			description: 'Ropa elegante y moderna para mujeres con descuentos por volumen',
			borderColor: 'border-pink-200',
			bgColor: 'bg-pink-50',
			titleColor: 'text-pink-900',
			descColor: 'text-pink-700'
		}
	};

	const config = $derived(tabConfig[activeTab]);
</script>

<div class="space-y-6">
	<div class="mb-6 rounded-lg border {config.borderColor} {config.bgColor} p-4">
		<h3 class="mb-2 font-semibold {config.titleColor}">{config.title}</h3>
		<p class="text-sm {config.descColor}">
			{config.description}
		</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each products as product}
			<ProductCard {product} {onAddToCart} />
		{/each}
	</div>
</div>
