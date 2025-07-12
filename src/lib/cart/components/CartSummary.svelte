<script lang="ts">
	interface Props {
		totalUnits: number;
		cartTotal: number;
		canProceedToPayment: boolean;
		missingUnitsForPayment: number;
		formatPrice: (price: number) => string;
	}

	let { totalUnits, cartTotal, canProceedToPayment, missingUnitsForPayment, formatPrice }: Props = $props();
</script>

{#if totalUnits > 0}
	<div class="mt-4 rounded-lg border p-4 {canProceedToPayment ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}">
		{#if canProceedToPayment}
			<p class="text-green-800">
				<strong>✅ ¡Listo para pagar!</strong> • {totalUnits} unidades en carrito • Total: <strong>{formatPrice(cartTotal)}</strong>
			</p>
		{:else}
			<p class="text-orange-800">
				<strong>📦 {totalUnits}/4 unidades</strong> • Te faltan <strong>{missingUnitsForPayment} unidades</strong> para poder pagar
			</p>
			<p class="mt-1 text-sm text-orange-600">
				Agrega más productos o incrementa las cantidades para alcanzar el mínimo de 4 unidades
			</p>
		{/if}
	</div>
{/if}
