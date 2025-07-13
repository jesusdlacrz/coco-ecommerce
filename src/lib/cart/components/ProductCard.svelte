<script lang="ts">
	import { ShoppingCart, Plus, Minus } from '@lucide/svelte';
	import { formatPrice } from '$lib/shared/utils/cartUtils';
	import type { Product } from '$lib/shared/model/products';

	interface Props {
		product: Product;
		onAddToCart: (
			product: Product,
			quantity: number,
			size: string | null,
			color: string | null
		) => void;
	}

	let { product, onAddToCart }: Props = $props();

	// Estados independientes por producto usando su ID único
	let selectedSize = $state<string>('');
	let selectedColor = $state<string>('');
	let quantity = $state<number>(1);

	const genderColors = {
		men: {
			primary: 'bg-blue-600 hover:bg-blue-700',
			secondary: 'border-blue-200 bg-blue-50',
			text: 'text-blue-900'
		},
		women: {
			primary: 'bg-pink-600 hover:bg-pink-700',
			secondary: 'border-pink-200 bg-pink-50',
			text: 'text-pink-900'
		}
	};

	const colors = genderColors[product.gender];

	function handleAddToCart() {
		if (product.sizes.length > 0 && !selectedSize) {
			alert('Por favor selecciona una talla');
			return;
		}
		if (product.colors.length > 0 && !selectedColor) {
			alert('Por favor selecciona un color');
			return;
		}

		onAddToCart(product, quantity, selectedSize || null, selectedColor || null);

		// Reset selections
		selectedSize = '';
		selectedColor = '';
		quantity = 1;
	}

	function incrementQuantity() {
		quantity += 1;
	}

	function decrementQuantity() {
		if (quantity > 1) {
			quantity -= 1;
		}
	}
</script>

<div class="rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg {colors.secondary}">
	<div class="p-4">
		<div class="relative mb-4 aspect-square">
			<img
				src={product.images[0] || '/placeholder.svg'}
				alt={product.name}
				class="h-full w-full rounded-md object-cover"
			/>
		</div>

		<div class="space-y-2">
			<div class="flex items-start justify-between">
				<span
					class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium {colors.text}"
				>
					{product.category}
				</span>
				<span class="text-xs text-gray-500">SKU: {product.sku}</span>
			</div>
			<h3 class="text-lg leading-tight font-semibold">{product.name}</h3>
		</div>
	</div>

	<div class="space-y-4 p-4 pt-0">
		<p class="line-clamp-2 text-sm text-gray-600">{product.description}</p>

		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-lg font-bold text-gray-900">
					{formatPrice(product.wholesalePrice || product.price)}
				</span>
				{#if product.wholesalePrice}
					<span class="text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>
				{/if}
			</div>
			<p class="text-xs text-gray-500">
				Stock: {product.stockQuantity} • Precio mayorista disponible
			</p>
		</div>

		<!-- Selección de talla -->
		{#if product.sizes.length > 0}
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700">Talla:</label>
				<select bind:value={selectedSize} class="w-full rounded-md border border-gray-300 p-2">
					<option value="">Seleccionar talla</option>
					{#each product.sizes as size (size)}
						<option value={size}>{size}</option>
					{/each}
				</select>
			</div>
		{/if}

		<!-- Selección de color -->
		{#if product.colors.length > 0}
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700">Color:</label>
				<select bind:value={selectedColor} class="w-full rounded-md border border-gray-300 p-2">
					<option value="">Seleccionar color</option>
					{#each product.colors as color (color)}
						<option value={color}>{color}</option>
					{/each}
				</select>
			</div>
		{/if}

		<!-- Cantidad -->
		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700">Cantidad:</label>
			<div class="flex items-center space-x-2">
				<button
					onclick={decrementQuantity}
					disabled={quantity <= 1}
					class="rounded border border-gray-300 p-1 hover:bg-gray-50 disabled:opacity-50"
				>
					<Minus class="h-4 w-4" />
				</button>
				<span class="min-w-[60px] rounded border px-3 py-1 text-center">{quantity}</span>
				<button
					onclick={incrementQuantity}
					class="rounded border border-gray-300 p-1 hover:bg-gray-50"
				>
					<Plus class="h-4 w-4" />
				</button>
			</div>
		</div>

		<button
			onclick={handleAddToCart}
			class="flex w-full items-center justify-center space-x-2 rounded-md px-4 py-2 text-white {colors.primary}"
		>
			<ShoppingCart class="h-4 w-4" />
			<span>Agregar al Carrito</span>
		</button>
	</div>
</div>
