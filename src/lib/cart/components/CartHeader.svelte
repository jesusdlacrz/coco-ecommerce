<script lang="ts">
	import { formatPrice } from '$lib/shared/utils/cartUtils';
	import X from '$lib/shared/icons/X.svelte';

	type Props = {
		totalItems: number;
		total: number;
		onClose: () => void;
	};

	let { totalItems, total, onClose }: Props = $props();
</script>

<div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
	<div>
		<h2 class="font-['Volkhov',serif] text-xl font-bold text-[#262635]">Carro De Compras</h2>
		<p class="mt-1 font-['Jost',sans-serif] text-sm text-gray-500">
			{totalItems} {totalItems === 1 ? 'producto' : 'productos'} — {formatPrice(total)}
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
