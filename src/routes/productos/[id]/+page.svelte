<script lang="ts">
	import { cartStore } from '$lib/cart/stores/cartStore';
	import type { PageData } from './$types';
	import ProductHeader from '$lib/detailproducts/components/ProductHeader.svelte';
	import ImageGallery from '$lib/detailproducts/components/ImageGallery.svelte';
	import ProductInfo from '$lib/detailproducts/components/ProductInfo.svelte';
	import ProductOptions from '$lib/detailproducts/components/ProductOptions.svelte';
	import ProductActions from '$lib/detailproducts/components/ProductActions.svelte';
	import ProductDetails from '$lib/detailproducts/components/ProductDetails.svelte';

	let { data }: { data: PageData } = $props();
	const { product } = data;

	// Estados del producto
	let selectedSize = $state<string>('');
	let selectedColor = $state<string>('');
	let quantity = $state<number>(1);
	let selectedImageIndex = $state<number>(0);

	// Funciones para manejar cambios
	function handleSizeSelect(size: string) {
		selectedSize = size;
	}

	function handleColorSelect(color: string) {
		selectedColor = color;
	}

	function handleQuantityChange(newQuantity: number) {
		quantity = newQuantity;
	}

	function handleImageSelect(index: number) {
		selectedImageIndex = index;
	}

	// Funciones de validación y carrito
	function validateSelections(): boolean {
		if (product.sizes.length > 0 && !selectedSize) {
			alert('Por favor selecciona una talla');
			return false;
		}
		if (product.colors.length > 0 && !selectedColor) {
			alert('Por favor selecciona un color');
			return false;
		}
		return true;
	}

	function handleAddToCart() {
		if (!validateSelections()) return;
		
		cartStore.addItem(product, quantity, selectedSize || null, selectedColor || null);
		alert('Producto agregado al carrito');
	}

	function handleGoToPay() {
		if (!validateSelections()) return;
		
		cartStore.addItem(product, quantity, selectedSize || null, selectedColor || null);
		// Aquí iría la lógica para ir directo al pago
		alert('Redirigiendo al pago...');
	}
</script>

<svelte:head>
	<title>{product.name} - Coco's</title>
	<meta name="description" content={product.description} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<ProductHeader />

	<!-- Contenido principal -->
	<div class="max-w-7xl mx-auto px-4 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Galería de imágenes -->
			<ImageGallery 
				images={product.images}
				productName={product.name}
				selectedImageIndex={selectedImageIndex}
				onImageSelect={handleImageSelect}
			/>

			<!-- Información y opciones del producto -->
			<div class="space-y-6">
				<ProductInfo product={product} />

				<ProductOptions 
					sizes={product.sizes}
					colors={product.colors}
					selectedSize={selectedSize}
					selectedColor={selectedColor}
					quantity={quantity}
					onSizeSelect={handleSizeSelect}
					onColorSelect={handleColorSelect}
					onQuantityChange={handleQuantityChange}
				/>

				<ProductActions 
					onAddToCart={handleAddToCart}
					onBuyNow={handleGoToPay}
				/>

				<ProductDetails product={product} />
			</div>
		</div>
	</div>
</div>
