<script lang="ts">
	import type { CartItem } from '$lib/shared/model/products';
	import CartItemComponent from './CartItem.svelte';

	type Props = {
		items: CartItem[];
		stockByItemId: Record<string, number>;
		onUpdateQuantity: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
		onNavigate?: () => void;
	};

	let { items, stockByItemId, onUpdateQuantity, onRemoveItem, onNavigate }: Props = $props();
</script>

<div class="space-y-3">
	{#each items as item (item.id)}
		<CartItemComponent
			{item}
			maxQuantity={stockByItemId[item.id]}
			{onUpdateQuantity}
			{onRemoveItem}
			{onNavigate}
		/>
	{/each}
</div>
