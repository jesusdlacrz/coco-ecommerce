<script lang="ts">
	import Plus from '$lib/shared/icons/Plus.svelte';
	import Minus from '$lib/shared/icons/Minus.svelte';
	import type { Color, ProductVariation } from '$lib/shared/model/products';
	import { stockForSize, stockForColor, stockForCombo } from '$lib/shared/model/stock';

	type Props = {
		sizes: string[];
		colors: Color[];
		variations: ProductVariation[];
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
		variations,
		selectedSize,
		selectedColor,
		quantity,
		onSizeSelect,
		onColorSelect,
		onQuantityChange
	}: Props = $props();

	// Sin datos de variación (producto simple, o uno que en WooCommerce
	// todavía no se convirtió a variable) no hay cómo saber el stock por
	// talla/color desde aquí — no se bloquea nada en el frontend en ese caso;
	// el checkout igual revalida el stock real contra el servidor.
	function sizeDisabled(size: string): boolean {
		return variations.length > 0 && stockForSize(variations, size, selectedColor || null) <= 0;
	}

	function colorDisabled(color: string): boolean {
		return variations.length > 0 && stockForColor(variations, color, selectedSize || null) <= 0;
	}

	// `null` = todavía no se puede saber (faltan variaciones, o falta elegir
	// talla/color) — en ese caso no se limita la cantidad desde el frontend.
	function maxQuantity(): number | null {
		if (variations.length === 0) return null;
		const needsSize = sizes.length > 0;
		const needsColor = colors.length > 0;
		if ((needsSize && !selectedSize) || (needsColor && !selectedColor)) return null;
		return stockForCombo(variations, needsSize ? selectedSize : null, needsColor ? selectedColor : null);
	}

	function clamp(value: number): number {
		const max = maxQuantity();
		return max !== null ? Math.min(value, max) : value;
	}

	function incrementQuantity() {
		onQuantityChange(clamp(quantity + 1));
	}

	function decrementQuantity() {
		if (quantity > 1) {
			onQuantityChange(quantity - 1);
		}
	}

	function handleInputChange(e: Event) {
		const raw = parseInt((e.target as HTMLInputElement).value, 10);
		if (!isNaN(raw) && raw >= 1) {
			onQuantityChange(clamp(raw));
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
			<span class="block text-sm font-medium font-display text-black mb-2">Talla:</span>
			<div class="flex flex-wrap gap-3">
				{#each sizes as size (size)}
					{@const disabled = sizeDisabled(size)}
					<button
						onclick={() => onSizeSelect(size)}
						{disabled}
						title={disabled ? 'Agotado' : undefined}
						style="font-family: 'Poppins', sans-serif;"
						class="w-10 h-10 text-sm border rounded-md transition-all flex items-center justify-center {disabled
							? 'cursor-not-allowed border-gray-200 text-gray-300 line-through'
							: selectedSize === size
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
			<span class="block text-sm font-medium font-display text-black mb-3">Color:</span>
			<div class="flex flex-wrap gap-2">
				{#each colors as color (color.name)}
					{@const disabled = colorDisabled(color.name)}
					<button
						title={disabled ? `${color.name} — Agotado` : color.name}
						aria-label={`Color ${color.name}${disabled ? ' (agotado)' : ''}`}
						onclick={() => onColorSelect(color.name)}
						{disabled}
						class={`relative w-8 h-8 rounded-full transition-all ${disabled ? 'cursor-not-allowed opacity-30' : ''} ${selectedColor === color.name
							? 'border-2 border-white ring-1 ring-black'
							: `${color.name === 'Blanco' ? 'border border-gray-400' : 'border border-gray-300'} hover:border-gray-400`}`}
						style="background-color: {color.hex}"
					></button>
				{/each}
			</div>
		</div>
	{/if}

	<div>
		<span class="block text-sm font-medium font-display text-black mb-2">Cantidad:</span>
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
				max={maxQuantity() ?? undefined}
				value={quantity}
				oninput={handleInputChange}
				onblur={handleInputBlur}
				class="w-10 text-center text-sm font-medium text-black bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				style="font-family: 'Poppins', sans-serif;"
			/>
			<button
				onclick={incrementQuantity}
				disabled={maxQuantity() !== null && quantity >= maxQuantity()!}
				class="flex h-8 w-8 items-center justify-center p-0 disabled:opacity-50"
			>
				<Plus size={12} />
			</button>
		</div>
		{#if maxQuantity() !== null}
			<p class="mt-1 font-body text-xs text-gray-400">
				{maxQuantity()} disponibles en esta combinación
			</p>
		{/if}
	</div>
</div>
