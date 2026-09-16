<script lang="ts">
	import { formatPrice } from '$lib/shared/utils/price';

	type Props = {
		cartItems: any[];
		total: number;
		totalItems: number;
		canCheckout: boolean;
		missingUnits: number;
		onClearCart: () => void;
		onCheckout: () => void;
	};

	let { cartItems, total, totalItems, canCheckout, missingUnits, onClearCart, onCheckout }: Props = $props();
</script>

{#if cartItems.length > 0}
	<div class="flex flex-col gap-4 px-6 py-5">
		<!-- Aviso B2B unidades mínimas -->
		{#if !canCheckout}
			<div class="rounded-md border border-orange-200 bg-orange-50 px-4 py-3">
				<p class="font-body text-sm font-semibold text-orange-700">
					{totalItems}/4 unidades mínimas
				</p>
				<p class="mt-0.5 font-body text-xs text-orange-500">
					Agrega {missingUnits} unidades más para proceder al pago
				</p>
			</div>
		{/if}

		<!-- Total -->
		<div class="flex items-center justify-between">
			<span class="font-display text-base font-bold text-ink">Total</span>
			<span class="font-body text-base font-bold text-ink"
				>{formatPrice(total)}</span
			>
		</div>

		<!-- Botones -->
		<div class="flex flex-col gap-2">
			<button
				disabled={!canCheckout}
				onclick={onCheckout}
				class="w-full rounded-md px-4 py-3 font-body text-sm font-semibold tracking-wide transition-colors
					{canCheckout
					? 'bg-ink text-white hover:bg-black'
					: 'cursor-not-allowed bg-gray-200 text-gray-400'}"
			>
				{canCheckout ? 'Proceder al Checkout' : `Faltan ${missingUnits} unidades`}
			</button>

			<button
				onclick={onClearCart}
				class="w-full py-2 font-body text-sm font-bold text-muted transition-colors hover:underline"
			>
				Limpiar Carrito
			</button>
		</div>
	</div>
{/if}
