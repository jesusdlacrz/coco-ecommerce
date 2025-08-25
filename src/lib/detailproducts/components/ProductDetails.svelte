<script lang="ts">
	import type { Product } from '$lib/shared/model/products';

	type Props = {
		product: Product;
	};

	let { product }: Props = $props();
</script>

<!-- Información adicional -->
<div class="border-t border-white pt-6 space-y-3 text-sm text-gray-600">
	<p><strong>Mínimo para mayorista:</strong> {product.minOrderQuantity} unidades</p>
	<p><strong>Disponibilidad:</strong> {product.inStock ? 'En stock' : 'Agotado'}</p>
</div>
