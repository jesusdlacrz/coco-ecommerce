<script lang="ts">
	import type { CartItem } from '$lib/shared/model/products';
	import CartSection from './CartSection.svelte';

	type Props = {
		cartItems: CartItem[];
		menItems: CartItem[];
		womenItems: CartItem[];
		boysItems: CartItem[];
		girlsItems: CartItem[];
		menItemsCount: number;
		womenItemsCount: number;
		boysItemsCount: number;
		girlsItemsCount: number;
		onUpdateQuantity: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
	};

	let { 
		cartItems, 
		menItems, 
		womenItems, 
		boysItems, 
		girlsItems,
		menItemsCount,
		womenItemsCount,
		boysItemsCount,
		girlsItemsCount,
		onUpdateQuantity, 
		onRemoveItem 
	}: Props = $props();

	// Configuraciones de categorías
	const categoryConfigs = {
		men: {
			title: 'Hombres',
			color: 'text-blue-900',
			bgColor: 'bg-blue-600'
		},
		women: {
			title: 'Mujeres',
			color: 'text-pink-900',
			bgColor: 'bg-pink-600'
		},
		boys: {
			title: 'Niños',
			color: 'text-green-900',
			bgColor: 'bg-green-600'
		},
		girls: {
			title: 'Niñas',
			color: 'text-purple-900',
			bgColor: 'bg-purple-600'
		}
	};
</script>

<div class="flex-1 overflow-y-auto p-4">
	{#if cartItems.length === 0}
		<div class="py-8 text-center">
			<p class="text-gray-500">Tu carrito está vacío</p>
		</div>
	{:else}
		<div class="space-y-6">
			<CartSection 
				items={menItems}
				categoryConfig={categoryConfigs.men}
				itemsCount={menItemsCount}
				{onUpdateQuantity}
				{onRemoveItem}
			/>

			<CartSection 
				items={womenItems}
				categoryConfig={categoryConfigs.women}
				itemsCount={womenItemsCount}
				{onUpdateQuantity}
				{onRemoveItem}
			/>

			<CartSection 
				items={boysItems}
				categoryConfig={categoryConfigs.boys}
				itemsCount={boysItemsCount}
				{onUpdateQuantity}
				{onRemoveItem}
			/>

			<CartSection 
				items={girlsItems}
				categoryConfig={categoryConfigs.girls}
				itemsCount={girlsItemsCount}
				{onUpdateQuantity}
				{onRemoveItem}
			/>
		</div>
	{/if}
</div>
