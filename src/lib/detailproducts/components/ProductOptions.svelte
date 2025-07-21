<script lang="ts">
	import Plus from '$lib/shared/icons/Plus.svelte';
	import Minus from '$lib/shared/icons/Minus.svelte';

	type Props = {
		sizes: string[];
		colors: string[];
		selectedSize: string;
		selectedColor: string;
		quantity: number;
		onSizeSelect: (size: string) => void;
		onColorSelect: (color: string) => void;
		onQuantityChange: (quantity: number) => void;
	};

	let { 
		sizes, 
		colors, 
		selectedSize, 
		selectedColor, 
		quantity, 
		onSizeSelect, 
		onColorSelect, 
		onQuantityChange 
	}: Props = $props();

	function incrementQuantity() {
		onQuantityChange(quantity + 1);
	}

	function decrementQuantity() {
		if (quantity > 1) {
			onQuantityChange(quantity - 1);
		}
	}
</script>

<div class="space-y-6">
	<!-- Selección de talla -->
	{#if sizes.length > 0}
		<div>
			<span class="block text-sm font-medium text-gray-700 mb-2">Talla:</span>
			<div class="grid grid-cols-6 gap-2">
				{#each sizes as size (size)}
					<button
						onclick={() => onSizeSelect(size)}
						class="py-2 px-3 text-sm border rounded-md transition-all {selectedSize === size
							? 'border-blue-500 bg-blue-50 text-blue-700'
							: 'border-gray-300 hover:border-gray-400'}"
					>
						{size}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Selección de color -->
	{#if colors.length > 0}
		<div>
			<span class="block text-sm font-medium text-gray-700 mb-2">Color:</span>
			<div class="grid grid-cols-3 gap-2">
				{#each colors as color (color)}
					<button
						onclick={() => onColorSelect(color)}
						class="py-2 px-3 text-sm border rounded-md transition-all {selectedColor === color
							? 'border-blue-500 bg-blue-50 text-blue-700'
							: 'border-gray-300 hover:border-gray-400'}"
					>
						{color}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Cantidad -->
	<div>
		<span class="block text-sm font-medium text-gray-700 mb-2">Cantidad:</span>
		<div class="flex items-center space-x-3">
			<button
				onclick={decrementQuantity}
				disabled={quantity <= 1}
				class="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
			>
				<Minus size={16} />
			</button>
			<span class="text-lg font-medium min-w-[3rem] text-center">{quantity}</span>
			<button
				onclick={incrementQuantity}
				class="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
			>
				<Plus size={16} />
			</button>
		</div>
	</div>
</div>
