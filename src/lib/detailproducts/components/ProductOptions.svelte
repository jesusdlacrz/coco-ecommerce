<script lang="ts">
	import Plus from '$lib/shared/icons/Plus.svelte';
	import Minus from '$lib/shared/icons/Minus.svelte';
	import type { Color, ProductVariation } from '$lib/shared/model/products';
	import { stockForSize, stockForColor, stockForCombo } from '$lib/shared/model/stock';
	import { formatSize, sortSizes } from '$lib/shared/model/sizes';

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

	// WooCommerce devuelve las tallas en el orden en que se crearon en el panel
	// (M, XS, XXS…) y con la caja que se haya escrito ahí.
	const sortedSizes = $derived(sortSizes(sizes));

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

	// Un segundo clic sobre la talla/color ya elegido lo deselecciona: es la
	// única forma de volver a "sin filtro" sin recargar la ficha, y es lo que
	// la gente intenta por instinto.
	function toggleSize(size: string) {
		onSizeSelect(selectedSize === size ? '' : size);
	}

	function toggleColor(color: string) {
		onColorSelect(selectedColor === color ? '' : color);
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
			<span class="mb-2 block font-display text-sm font-medium text-ink">Talla:</span>
			<div class="flex flex-wrap gap-3">
				{#each sortedSizes as size (size)}
					{@const disabled = sizeDisabled(size)}
					{@const selected = selectedSize === size}
					<button
						onclick={() => toggleSize(size)}
						{disabled}
						aria-pressed={selected}
						title={disabled ? 'Agotado' : selected ? 'Quitar selección' : undefined}
						class="flex h-11 w-11 items-center justify-center rounded-lg border font-poppins text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent {disabled
							? 'cursor-not-allowed border-line-soft text-line line-through'
							: selected
								? 'border-ink bg-ink text-white'
								: 'border-line text-ink hover:border-ink'}"
					>
						{formatSize(size)}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if colors.length > 0}
		<div>
			<span class="mb-3 block font-display text-sm font-medium text-ink">Color:</span>
			<div class="flex flex-wrap gap-1">
				{#each colors as color (color.name)}
					{@const disabled = colorDisabled(color.name)}
					{@const selected = selectedColor === color.name}
					<button
						title={disabled
							? `${color.name} — Agotado`
							: selected
								? `${color.name} — quitar selección`
								: color.name}
						aria-label="Color {color.name}{disabled ? ' (agotado)' : ''}"
						aria-pressed={selected}
						onclick={() => toggleColor(color.name)}
						{disabled}
						class="flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent {disabled
							? 'cursor-not-allowed opacity-30'
							: 'hover:bg-graybrand/40'}"
					>
						<span
							class="h-8 w-8 rounded-full transition-all {selected
								? 'border-2 border-white ring-2 ring-ink'
								: 'border border-line'}"
							style="background-color: {color.hex}"
						></span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div>
		<span class="mb-2 block font-display text-sm font-medium text-ink">Cantidad:</span>
		<div class="flex h-11 max-w-[128px] items-center justify-between rounded-lg bg-white px-1 shadow">
			<button
				onclick={decrementQuantity}
				disabled={quantity <= 1}
				aria-label="Quitar una unidad"
				class="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-graybrand/40 disabled:opacity-40 disabled:hover:bg-transparent"
			>
				<Minus size={12} class="text-ink" />
			</button>
			<input
				type="number"
				min="1"
				max={maxQuantity() ?? undefined}
				value={quantity}
				oninput={handleInputChange}
				onblur={handleInputBlur}
				aria-label="Cantidad"
				class="w-10 bg-transparent text-center font-poppins text-sm font-medium text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
			/>
			<button
				onclick={incrementQuantity}
				disabled={maxQuantity() !== null && quantity >= maxQuantity()!}
				aria-label="Agregar una unidad"
				class="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-graybrand/40 disabled:opacity-40 disabled:hover:bg-transparent"
			>
				<Plus size={12} />
			</button>
		</div>
		{#if maxQuantity() !== null}
			<p class="mt-1 font-body text-xs text-muted-faint">
				{maxQuantity()} disponibles en esta combinación
			</p>
		{/if}
	</div>
</div>
