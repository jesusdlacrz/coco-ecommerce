<script lang="ts">
	import type { CartItem } from '$lib/shared/model/products';
	import CartSection from './CartSection.svelte';
	import EmptyState from '$lib/shared/components/EmptyState.svelte';

	type Props = {
		cartItems: CartItem[];
		stockByItemId: Record<string, number>;
		onUpdateQuantity: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
		onNavigate?: () => void;
	};

	let { cartItems, stockByItemId, onUpdateQuantity, onRemoveItem, onNavigate }: Props = $props();
</script>

<div class="flex-1 overflow-y-auto">
	{#if cartItems.length === 0}
		<EmptyState
			title="Tu carrito está vacío"
			description="Agrega productos desde el catálogo para empezar tu pedido."
		/>
	{:else}
		<!-- Una sola lista. Antes se partía en cuatro por género y se
		     concatenaban sin título ni separación visual: la partición no
		     aportaba nada y, peor, una prenda cuyo `gender` no fuera uno de los
		     cuatro desaparecía del carrito aunque siguiera sumando al total. -->
		<CartSection items={cartItems} {stockByItemId} {onUpdateQuantity} {onRemoveItem} {onNavigate} />
	{/if}
</div>
