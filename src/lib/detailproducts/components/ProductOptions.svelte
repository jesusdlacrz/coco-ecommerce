<script lang="ts">
	import Plus from '$lib/shared/icons/Plus.svelte';
	import Minus from '$lib/shared/icons/Minus.svelte';
	import type { Color } from '$lib/shared/model/products';

	type Props = {
		sizes: string[];
		colors: Color[];
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

	function handleInputChange(e: Event) {
		const raw = parseInt((e.target as HTMLInputElement).value, 10);
		if (!isNaN(raw) && raw >= 1) {
			onQuantityChange(raw);
		}
	}

	function handleInputBlur(e: Event) {
		const raw = parseInt((e.target as HTMLInputElement).value, 10);
		// Reset to last valid value if user left an invalid/empty field
		if (isNaN(raw) || raw < 1) {
			(e.target as HTMLInputElement).value = String(quantity);
		}
	}
</script>

<div class="space-y-6">
	{#if sizes.length > 0}
		<div>
			<span class="block text-sm font-medium font-['Volkhov',serif] text-black mb-2">Talla:</span>
			<div class="flex flex-wrap gap-3">
				{#each sizes as size (size)}
					<button
						onclick={() => onSizeSelect(size)}
						style="font-family: 'Poppins', sans-serif;"
						class="w-10 h-10 text-sm border rounded-md transition-all flex items-center justify-center {selectedSize === size
							? 'border-black bg-black text-white'
							: 'border-black hover:border-gray-800'}"
					>
						{size}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if colors.length > 0}
		<div>
			<span class="block text-sm font-medium font-['Volkhov',serif] text-black mb-3">Color:</span>
			<div class="flex flex-wrap gap-2">
				{#each colors as color (color.name)}
					<button
						title={color.name}
						aria-label={`Color ${color.name}`}
						onclick={() => onColorSelect(color.name)}
						class={`w-8 h-8 rounded-full transition-all ${selectedColor === color.name
							? 'border-2 border-white ring-1 ring-black'
							: `${color.name === 'Blanco' ? 'border border-gray-400' : 'border border-gray-300'} hover:border-gray-400`}`}
						style="background-color: {color.hex}"
					></button>
				{/each}
			</div>
		</div>
	{/if}

	<div>
		<span class="block text-sm font-medium font-['Volkhov',serif] text-black mb-2">Cantidad:</span>
		<div class="flex items-center space-x-2 bg-white h-10 max-w-[115px] shadow rounded">
			<button
				onclick={decrementQuantity}
				disabled={quantity <= 1}
				class="flex h-8 w-8 items-center justify-center p-0 disabled:opacity-50"
			>
				<Minus size={12} class="text-black" />
			</button>
			<input
				type="number"
				min="1"
				value={quantity}
				oninput={handleInputChange}
				onblur={handleInputBlur}
				class="w-10 text-center text-sm font-medium text-black bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				style="font-family: 'Poppins', sans-serif;"
			/>
			<button
				onclick={incrementQuantity}
				class="flex h-8 w-8 items-center justify-center p-0"
			>
				<Plus size={12} />
			</button>
		</div>
	</div>
</div>
