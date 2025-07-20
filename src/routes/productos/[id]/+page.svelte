<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatPrice } from '$lib/shared/utils/cartUtils';
	import { cartStore } from '$lib/cart/stores/cartStore';
	import type { PageData } from './$types';
	import Plus from '$lib/shared/icons/Plus.svelte';
	import Minus from '$lib/shared/icons/Minus.svelte';
	import ShoppingCart from '$lib/shared/icons/ShoppingCart.svelte';

	let { data }: { data: PageData } = $props();
	const { product } = data;

	// Estados del producto
	let selectedSize = $state<string>('');
	let selectedColor = $state<string>('');
	let quantity = $state<number>(1);
	let selectedImageIndex = $state<number>(0);

	// Funciones
	function handleAddToCart() {
		if (product.sizes.length > 0 && !selectedSize) {
			alert('Por favor selecciona una talla');
			return;
		}
		if (product.colors.length > 0 && !selectedColor) {
			alert('Por favor selecciona un color');
			return;
		}

		cartStore.addItem(product, quantity, selectedSize || null, selectedColor || null);
		alert('Producto agregado al carrito');
	}

	function handleGoToPay() {
		if (product.sizes.length > 0 && !selectedSize) {
			alert('Por favor selecciona una talla');
			return;
		}
		if (product.colors.length > 0 && !selectedColor) {
			alert('Por favor selecciona un color');
			return;
		}

		cartStore.addItem(product, quantity, selectedSize || null, selectedColor || null);
		// Aquí iría la lógica para ir directo al pago
		alert('Redirigiendo al pago...');
	}

	function incrementQuantity() {
		quantity += 1;
	}

	function decrementQuantity() {
		if (quantity > 1) {
			quantity -= 1;
		}
	}

	function goBack() {
		goto('/');
	}
</script>

<svelte:head>
	<title>{product.name} - Coco's</title>
	<meta name="description" content={product.description} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header con botón de regreso -->
	<div class="bg-white shadow-sm border-b">
		<div class="max-w-7xl mx-auto px-4 py-4">
			<button 
				onclick={goBack}
				class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
			>
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
				</svg>
				Volver al catálogo
			</button>
		</div>
	</div>

	<!-- Contenido principal -->
	<div class="max-w-7xl mx-auto px-4 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Galería de imágenes -->
			<div class="space-y-4">
				<!-- Imagen principal -->
				<div class="aspect-square bg-white rounded-lg shadow-lg overflow-hidden">
					<img
						src={product.images[selectedImageIndex] || '/placeholder.svg'}
						alt={product.name}
						class="w-full h-full object-cover"
					/>
				</div>
				
				<!-- Miniaturas (si hay múltiples imágenes) -->
				{#if product.images.length > 1}
					<div class="grid grid-cols-4 gap-2">
						{#each product.images as image, index}
							<button
								onclick={() => selectedImageIndex = index}
								class="aspect-square bg-white rounded border-2 overflow-hidden transition-all {selectedImageIndex === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}"
							>
								<img src={image} alt="Vista {index + 1}" class="w-full h-full object-cover" />
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Información y opciones del producto -->
			<div class="space-y-6">
				<div>
					<span class="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full mb-2">
						{product.category}
					</span>
					<h1 class="text-3xl font-bold text-gray-900">{product.name}</h1>
					<p class="text-gray-600 mt-2">{product.description}</p>
				</div>

				<!-- Precios -->
				<div class="space-y-2">
					<div class="flex items-center space-x-3">
						<span class="text-3xl font-bold text-gray-900">
							{formatPrice(product.wholesalePrice || product.price)}
						</span>
						{#if product.wholesalePrice}
							<span class="text-lg text-gray-500 line-through">
								{formatPrice(product.price)}
							</span>
						{/if}
					</div>
					<p class="text-sm text-gray-600">
						SKU: {product.sku} • Stock: {product.stockQuantity}
					</p>
				</div>

				<!-- Selección de talla -->
				{#if product.sizes.length > 0}
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Talla:</label>
						<div class="grid grid-cols-6 gap-2">
							{#each product.sizes as size}
								<button
									onclick={() => selectedSize = size}
									class="py-2 px-3 text-sm border rounded-md transition-all {selectedSize === size
										? 'border-blue-500 bg-blue-50 text-blue-700'
										: 'border-gray-300 hover:border-gray-400'}"
								>
									{size}
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Selección de color -->
				{#if product.colors.length > 0}
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Color:</label>
						<div class="grid grid-cols-3 gap-2">
							{#each product.colors as color}
								<button
									onclick={() => selectedColor = color}
									class="py-2 px-3 text-sm border rounded-md transition-all {selectedColor === color
										? 'border-blue-500 bg-blue-50 text-blue-700'
										: 'border-gray-300 hover:border-gray-400'}"
								>
									{color}
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Cantidad -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Cantidad:</label>
					<div class="flex items-center space-x-3">
						<button
							onclick={decrementQuantity}
							disabled={quantity <= 1}
							class="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
						>
							<Minus size={16} />
						</button>
						<span class="text-lg font-medium min-w-[3rem] text-center">{quantity}</span>
						<button
							onclick={incrementQuantity}
							class="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
						>
							<Plus size={16} />
						</button>
					</div>
				</div>

				<!-- Botones de acción -->
				<div class="space-y-3 pt-4">
					<button
						onclick={handleAddToCart}
						class="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						<ShoppingCart size={20} />
						<span>Agregar al Carrito</span>
					</button>
					
					<button
						onclick={handleGoToPay}
						class="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
					>
						Comprar Ahora
					</button>
				</div>

				<!-- Información adicional -->
				<div class="border-t pt-6 space-y-3 text-sm text-gray-600">
					<p><strong>Mínimo para mayorista:</strong> {product.minOrderQuantity} unidades</p>
					<p><strong>Disponibilidad:</strong> {product.inStock ? 'En stock' : 'Agotado'}</p>
				</div>
			</div>
		</div>
	</div>
</div>
