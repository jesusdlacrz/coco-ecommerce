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

<!-- Header -->
<div class="flex items-center justify-between p-4">
	<div>
		<h2 class="text-lg font-semibold text-black mb-2 ml-4">Carro De Compras</h2>
		<p style="font-family: 'Poppins', sans-serif;" class="text-sm text-gray-600 ml-4">{totalItems} productos - {formatPrice(total)}</p>
	</div>
	<button onclick={onClose} class="rounded p-2 hover:bg-gray-100">
		<X size={20} />
	</button>
</div>
