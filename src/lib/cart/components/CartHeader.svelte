<script lang="ts">
	import { formatPrice } from '$lib/shared/utils/price';
	import X from '$lib/shared/icons/X.svelte';

	type Props = {
		totalItems: number;
		total: number;
		onClose: () => void;
	};

	let { totalItems, total, onClose }: Props = $props();
</script>

<div class="flex items-start justify-between border-b border-gray-100 px-6 pt-6 pb-4">
	<div>
		<h2 class="font-display text-xl font-bold text-ink">Carro De Compras</h2>
		<p class="mt-1 font-body text-sm text-gray-500">
			{totalItems}
			{totalItems === 1 ? 'producto' : 'productos'} — {formatPrice(total)}
		</p>
	</div>
	<button
		onclick={onClose}
		aria-label="Cerrar carrito"
		class="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
	>
		<X size={18} />
	</button>
</div>
