<script lang="ts">
	import type { CartItem } from '$lib/shared/model/products';
	import CartSection from './CartSection.svelte';
	import EmptyState from '$lib/shared/components/EmptyState.svelte';

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
		stockByItemId: Record<string, number>;
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
		stockByItemId,
		onUpdateQuantity,
		onRemoveItem
	}: Props = $props();

</script>

<div class="flex-1 overflow-y-auto p-6">
	{#if cartItems.length === 0}
		<EmptyState
			title="Tu carrito está vacío"
			description="Agrega productos desde el catálogo para empezar tu pedido."
		/>
	{:else}
		<div class="space-y-6">
			<CartSection
				items={menItems}

				itemsCount={menItemsCount}
				{stockByItemId}
				{onUpdateQuantity}
				{onRemoveItem}
			/>

			<CartSection
				items={womenItems}

				itemsCount={womenItemsCount}
				{stockByItemId}
				{onUpdateQuantity}
				{onRemoveItem}
			/>

			<CartSection
				items={boysItems}

				itemsCount={boysItemsCount}
				{stockByItemId}
				{onUpdateQuantity}
				{onRemoveItem}
			/>

			<CartSection
				items={girlsItems}

				itemsCount={girlsItemsCount}
				{stockByItemId}
				{onUpdateQuantity}
				{onRemoveItem}
			/>
		</div>
	{/if}
</div>
