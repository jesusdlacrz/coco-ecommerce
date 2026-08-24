<script lang="ts">
	import type { CartItem } from '$lib/shared/model/products';
	import CartItemComponent from './CartItem.svelte';



	type Props = {
		items: CartItem[];
		itemsCount: number;
		stockByItemId: Record<string, number>;
		onUpdateQuantity: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
	};

	let { items, itemsCount, stockByItemId, onUpdateQuantity, onRemoveItem }: Props = $props();
</script>

{#if items.length > 0}
	<div>
		<div class="space-y-3">
			{#each items as item (item.id + '-' + item.quantity)}
				<CartItemComponent
					{item}
					maxQuantity={stockByItemId[item.id]}
					{onUpdateQuantity}
					{onRemoveItem}
				/>
			{/each}
		</div>
	</div>
{/if}
