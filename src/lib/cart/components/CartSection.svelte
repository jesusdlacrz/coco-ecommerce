<script lang="ts">
	import type { CartItem } from '$lib/shared/model/products';
	import CartItemComponent from './CartItem.svelte';

	type CategoryConfig = {
		title: string;
		color: string;
		bgColor: string;
	};

	type Props = {
		items: CartItem[];
		categoryConfig: CategoryConfig;
		itemsCount: number;
		onUpdateQuantity: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
	};

	let { items, categoryConfig, itemsCount, onUpdateQuantity, onRemoveItem }: Props = $props();
</script>

{#if items.length > 0}
	<div>
		<h3 class="mb-3 flex items-center font-medium {categoryConfig.color}">
			<div class="mr-2 h-3 w-3 rounded-full {categoryConfig.bgColor}"></div>
			{categoryConfig.title} ({itemsCount})
		</h3>
		<div class="space-y-3">
			{#each items as item (item.id + '-' + item.quantity)}
				<CartItemComponent 
					{item} 
					{onUpdateQuantity} 
					{onRemoveItem} 
				/>
			{/each}
		</div>
	</div>
{/if}
