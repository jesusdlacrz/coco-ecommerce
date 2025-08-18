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

</script>

<div class="flex-1 overflow-y-auto p-6">
	{#if cartItems.length === 0}
		<div class="py-8 text-center">
			<p class="text-gray-500">Tu carrito está vacío</p>
		</div>
	{:else}
		<div class="space-y-6">
			<CartSection 
				items={menItems}

				itemsCount={menItemsCount}
				{onUpdateQuantity}
				{onRemoveItem}
			/>

			<CartSection 
				items={womenItems}

				itemsCount={womenItemsCount}
				{onUpdateQuantity}
				{onRemoveItem}
			/>

			<CartSection 
				items={boysItems}

				itemsCount={boysItemsCount}
				{onUpdateQuantity}
				{onRemoveItem}
			/>

			<CartSection 
				items={girlsItems}

				itemsCount={girlsItemsCount}
				{onUpdateQuantity}
				{onRemoveItem}
			/>
		</div>
	{/if}
</div>
