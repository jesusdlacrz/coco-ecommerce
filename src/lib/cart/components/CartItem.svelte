<script lang="ts">
	import { formatPrice } from '$lib/shared/utils/price';
	import type { CartItem } from '$lib/shared/model/products';
	import Plus from '$lib/shared/icons/Plus.svelte';
	import Minus from '$lib/shared/icons/Minus.svelte';

	type Props = {
		item: CartItem;
		onUpdateQuantity: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
	};

	let { item, onUpdateQuantity, onRemoveItem }: Props = $props();

	const meta = $derived(
		[item.size ? `Talla: ${item.size}` : '', item.color ? `Color: ${item.color}` : '']
			.filter(Boolean)
			.join(' | ')
	);
</script>

<div class="flex gap-3 border-b border-gray-100 px-6 py-4">
	<!-- Imagen -->
	<div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-50">
		<img
			src={item.image || '/placeholder.svg'}
			alt={item.name}
			class="h-full w-full object-cover"
		/>
	</div>

	<!-- Info -->
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<div class="flex items-start justify-between gap-2">
			<h4 class="font-['Volkhov',serif] text-sm leading-snug font-semibold text-[#262635]">
				{item.name}
			</h4>
			<!-- X sutil -->
			<button
				onclick={() => onRemoveItem(item.id)}
				aria-label="Eliminar {item.name}"
				class="flex-shrink-0 text-gray-300 transition-colors hover:text-[#262635]"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		{#if meta}
			<p class="font-['Jost',sans-serif] text-xs text-gray-400">{meta}</p>
		{/if}

		<p class="font-['Jost',sans-serif] text-sm font-semibold text-[#262635]">
			{formatPrice(item.price)}
		</p>

		<!-- Selector de cantidad -->
		<div class="mt-1 flex h-8 w-fit items-center rounded bg-gray-100">
			<button
				onclick={() => onUpdateQuantity(item.id, item.quantity - 1)}
				disabled={item.quantity <= 1}
				class="flex h-8 w-8 items-center justify-center rounded-l text-[#262635] transition-colors hover:bg-gray-200 disabled:opacity-30"
			>
				<Minus size={11} />
			</button>
			<span class="w-8 text-center font-['Jost',sans-serif] text-sm font-bold text-[#262635]">
				{item.quantity}
			</span>
			<button
				onclick={() => onUpdateQuantity(item.id, item.quantity + 1)}
				class="flex h-8 w-8 items-center justify-center rounded-r text-[#262635] transition-colors hover:bg-gray-200"
			>
				<Plus size={11} />
			</button>
		</div>
	</div>
</div>
