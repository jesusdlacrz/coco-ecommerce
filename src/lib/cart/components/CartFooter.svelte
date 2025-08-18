<script lang="ts">
	import { formatPrice } from '$lib/shared/utils/cartUtils';

	type Props = {
		cartItems: any[];
		total: number;
		totalItems: number;
		canCheckout: boolean;
		missingUnits: number;
		onClearCart: () => void;
	};

	let { cartItems, total, totalItems, canCheckout, missingUnits, onClearCart }: Props = $props();
</script>

<!-- Footer -->
{#if cartItems.length > 0}
	<div class="space-y-4  p-6">
		<!-- Mínimo de unidades -->
		{#if !canCheckout}
			<div class="rounded-lg border border-orange-200 bg-orange-50 p-3">
				<p class="text-sm font-medium text-orange-800">
					{totalItems}/4 unidades mínimas
				</p>
				<p class="mt-1 text-xs text-orange-600">
					Agrega {missingUnits} unidades más para proceder al pago
				</p>
			</div>
		{/if}

		<div class="flex items-center justify-between text-lg font-bold">
			<span>Total</span>
			<span>{formatPrice(total)}</span>
		</div>

		<div class="space-y-2">
			<button
				style="font-family: 'Poppins', sans-serif;"
				class="w-full rounded px-4 py-2 font-medium transition-colors {canCheckout
					? 'bg-[#262635] text-white'
					: 'cursor-not-allowed bg-gray-300 text-gray-500'}"
				disabled={!canCheckout}
			>
				{canCheckout ? 'Proceder al Checkout' : `Faltan ${missingUnits} unidades`}
			</button>
			<button
				onclick={onClearCart}
				class="w-full rounded border-gray-300 px-4 py-2 hover:bg-gray-50"
			>
				Limpiar Carrito
			</button>
		</div>
	</div>
{/if}
