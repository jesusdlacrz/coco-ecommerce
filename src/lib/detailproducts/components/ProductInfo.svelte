<script lang="ts">
	import {
		formatPrice,
		displayPrice as getDisplayPrice,
		strikePrice,
		savingsPercent
	} from '$lib/shared/utils/price';
	import type { Product } from '$lib/shared/model/products';

	type Props = { product: Product };
	let { product }: Props = $props();

	const displayPrice = $derived(getDisplayPrice(product));
	const originalPrice = $derived(strikePrice(product));
	const savingsPct = $derived(originalPrice ? savingsPercent(displayPrice, originalPrice) : 0);
</script>

<!-- Título con serif premium -->
<div>
	<h1 class="font-display text-3xl font-bold text-ink">{product.name}</h1>
	<div class="prose-description mt-1 font-body text-muted-soft">
		<!-- La descripción viene del panel de WordPress, escrita por la dueña de la
		     tienda, y llega con etiquetas (<p>, <strong>, listas) que hay que
		     renderizar. No es entrada de un visitante, así que no hay superficie
		     de XSS por parte de terceros: quien puede escribir aquí ya tiene
		     acceso de administración a WooCommerce. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html product.description}
	</div>
</div>

<!-- Precios -->
<div class="space-y-1">
	<div class="flex flex-wrap items-center gap-3">
		<span class="font-display text-3xl font-bold text-ink"
			>{formatPrice(displayPrice)}</span
		>
		{#if originalPrice}
			<span class="font-body text-lg text-muted-faint line-through"
				>{formatPrice(originalPrice)}</span
			>
			<span
				class="rounded-full bg-accent px-2.5 py-0.5 font-poppins text-xs font-semibold text-white"
			>
				AHORRAS {savingsPct}%
			</span>
		{/if}
	</div>
	<p class="font-body text-sm text-muted-soft">
		SKU: {product.sku} • Stock: {product.stockQuantity}
	</p>
</div>

<style>
	/* La descripción viene de WordPress como HTML (ej. envuelta en <p>), que
	   trae su propio margen por defecto — se resetea para que quede pegada
	   al título como el diseño original. */
	.prose-description :global(p) {
		margin: 0;
	}
</style>
