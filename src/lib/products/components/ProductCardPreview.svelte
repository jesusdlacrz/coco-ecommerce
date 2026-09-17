<script lang="ts">
	import type { Product } from '$lib/shared/model/products';
	import { formatPrice, displayPrice } from '$lib/shared/utils/price';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';

	interface Props {
		product: Product;
		category?: string;
		/** Las tarjetas de la primera fila entran ya visibles: diferirlas
		 *  retrasa el elemento más grande de la página. */
		priority?: boolean;
	}

	let { product, category = '', priority = false }: Props = $props();

	const store = $derived(page.data.storefront ?? HOUSE_STORE);
	const isAlmostSoldOut = $derived(product.stockQuantity <= 20);
</script>

<a
	href={`${store.basePath}/productos/${product.id}${category ? `?category=${category}&from=home` : ''}`}
	class="group w-full cursor-pointer rounded-lg bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
>
	<div class="p-4">
		<!-- Imagen del producto -->
		<div class="relative mb-3 aspect-[3/4] overflow-hidden rounded-md">
			<img
				src={product.images[0] || '/placeholder.svg'}
				srcset={product.imageSrcsets?.[0] || undefined}
				sizes="(min-width: 768px) 400px, (min-width: 640px) 50vw, 100vw"
				alt={product.name}
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				loading={priority ? 'eager' : 'lazy'}
				decoding="async"
			/>
		</div>

		<!-- Información del producto -->
		<div class="space-y-2 text-left">
			<h3 class="line-clamp-2 font-medium">
				{product.name}
			</h3>

			<span class="block text-xl font-medium">
				{formatPrice(displayPrice(product))}
			</span>

			{#if isAlmostSoldOut}
				<span
					class="inline-block rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600"
				>
					Pocas unidades
				</span>
			{/if}
		</div>
	</div>
</a>
