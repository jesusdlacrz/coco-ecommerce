<script lang="ts">
	import { formatPrice } from '$lib/shared/utils/cartUtils';
	import type { CartItem } from '$lib/shared/model/products';
	import Plus from '$lib/shared/icons/Plus.svelte';
	import Minus from '$lib/shared/icons/Minus.svelte';
	import Trash from '$lib/shared/icons/Trash.svelte';

	type Props = {
		item: CartItem;
		onUpdateQuantity: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
	};

	let { item, onUpdateQuantity, onRemoveItem }: Props = $props();
</script>

<div class="flex space-x-3 rounded-lg border p-3">
	<div class="h-16 w-16 flex-shrink-0">
		<img
			src={item.image || '/placeholder.svg'}
			alt={item.name}
			class="h-full w-full rounded object-cover"
		/>
	</div>

	<div class="min-w-0 flex-1">
		<h4 class="truncate text-sm font-medium">{item.name}</h4>
		<div class="mt-1 flex flex-wrap gap-1">
			{#if item.size}
				<span
					class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
				>
					{item.size}
				</span>
			{/if}
			{#if item.color}
				<span
					class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
				>
					{item.color}
				</span>
			{/if}
		</div>
		<p class="mt-1 text-sm font-medium text-gray-900">
			{formatPrice(item.price)}
		</p>

		<div class="mt-2 flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<button
					onclick={() => onUpdateQuantity(item.id, item.quantity - 1)}
					disabled={item.quantity <= 1}
					class="flex h-8 w-8 items-center justify-center rounded border p-0 hover:bg-gray-50 disabled:opacity-50"
				>
					<Minus size={12} />
				</button>
				<span class="min-w-[2rem] px-3 text-center text-sm font-medium"
					>{item.quantity}</span
				>
				<button
					onclick={() => onUpdateQuantity(item.id, item.quantity + 1)}
					class="flex h-8 w-8 items-center justify-center rounded border p-0 hover:bg-gray-50"
				>
					<Plus size={12} />
				</button>
			</div>

			<button
				onclick={() => onRemoveItem(item.id)}
				class="h-6 w-6 p-0 text-red-500 hover:text-red-700"
			>
				<Trash size={12} />
			</button>
		</div>
	</div>
</div>
