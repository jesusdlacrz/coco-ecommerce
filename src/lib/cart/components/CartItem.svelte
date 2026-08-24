<script lang="ts">
	import { formatPrice } from '$lib/shared/utils/price';
	import type { CartItem } from '$lib/shared/model/products';
	import Plus from '$lib/shared/icons/Plus.svelte';
	import Minus from '$lib/shared/icons/Minus.svelte';

	type Props = {
		item: CartItem;
		// `undefined` mientras la revalidación de stock del carrito todavía no
		// responde — en ese instante no se limita nada (el checkout igual lo
		// revalida en el servidor antes de cobrar).
		maxQuantity?: number;
		onUpdateQuantity: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
	};

	let { item, maxQuantity, onUpdateQuantity, onRemoveItem }: Props = $props();

	function clamp(value: number): number {
		return maxQuantity !== undefined ? Math.min(value, maxQuantity) : value;
	}

	const meta = $derived(
		[item.size ? `Talla: ${item.size}` : '', item.color ? `Color: ${item.color}` : '']
			.filter(Boolean)
			.join(' | ')
	);

	// Se confirma al salir del campo (blur/Enter), no en cada tecla — así el
	// usuario puede borrar y escribir un número nuevo sin que se corrija a
	// mitad de camino. Cualquier valor inválido (vacío, texto, 0, negativo)
	// vuelve a la cantidad actual.
	//
	// input.value se fuerza a mano: si el usuario borra el campo y el valor
	// corregido termina siendo igual al que ya tenía item.quantity, Svelte no
	// vuelve a escribir el atributo `value` (no detecta cambio) y el campo se
	// queda visualmente vacío aunque el estado interno sea correcto.
	function commitQuantity(input: HTMLInputElement) {
		const parsed = Math.floor(Number(input.value));
		const next = clamp(Number.isFinite(parsed) && parsed >= 1 ? parsed : item.quantity);
		input.value = String(next);
		if (next !== item.quantity) onUpdateQuantity(item.id, next);
	}
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
			<input
				type="number"
				inputmode="numeric"
				min="1"
				max={maxQuantity}
				step="1"
				value={item.quantity}
				onchange={(e) => commitQuantity(e.currentTarget)}
				aria-label="Cantidad de {item.name}"
				class="w-8 border-0 bg-transparent text-center font-['Jost',sans-serif] text-sm font-bold text-[#262635] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
			/>
			<button
				onclick={() => onUpdateQuantity(item.id, clamp(item.quantity + 1))}
				disabled={maxQuantity !== undefined && item.quantity >= maxQuantity}
				class="flex h-8 w-8 items-center justify-center rounded-r text-[#262635] transition-colors hover:bg-gray-200 disabled:opacity-30"
			>
				<Plus size={11} />
			</button>
		</div>
		{#if maxQuantity !== undefined && maxQuantity < item.quantity}
			<p class="mt-1 font-['Jost',sans-serif] text-xs text-[#e05c5c]">
				Solo quedan {maxQuantity} disponibles — ajusta la cantidad
			</p>
		{/if}
	</div>
</div>
