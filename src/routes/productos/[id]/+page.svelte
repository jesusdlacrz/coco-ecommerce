<script lang="ts">
	import { cartStore } from '$lib/cart/stores/cartStore';
	import { page } from '$app/state';
	import { activeCategory, type Category } from '$lib/shared/stores/categoryStore';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import ProductHeader from '$lib/detailproducts/components/ProductHeader.svelte';
	import ImageGallery from '$lib/detailproducts/components/ImageGallery.svelte';
	import ProductInfo from '$lib/detailproducts/components/ProductInfo.svelte';
	import ProductOptions from '$lib/detailproducts/components/ProductOptions.svelte';
	import ProductActions from '$lib/detailproducts/components/ProductActions.svelte';
	import ProductDetails from '$lib/detailproducts/components/ProductDetails.svelte';
	import Breadcrumbs from '$lib/shared/components/Breadcrumbs.svelte';
	import toast from 'svelte-5-french-toast';

	let { data }: { data: PageData } = $props();
	const { product } = data;

	// Obtener la categoría y origen desde los query parameters
	const categoryParam = $derived(page.url.searchParams.get('category'));
	const fromParam = $derived(page.url.searchParams.get('from'));
	const isFromProductsPage = $derived(fromParam === 'productos');

	// Update global category store when component mounts or category changes
	onMount(() => {
		if (categoryParam && ['men', 'women', 'boys', 'girls'].includes(categoryParam)) {
			activeCategory.set(categoryParam as Category);
		}
	});

	$effect(() => {
		if (categoryParam && ['men', 'women', 'boys', 'girls'].includes(categoryParam)) {
			activeCategory.set(categoryParam as Category);
		}
	});

	// Generar breadcrumbs basado en el contexto
	const breadcrumbs = $derived(() => {
		const categoryLabels: Record<string, string> = {
			men: 'Hombres',
			women: 'Mujeres', 
			boys: 'Niños',
			girls: 'Niñas'
		};

		const crumbs = [
			{ label: 'Inicio', href: categoryParam ? `/?category=${categoryParam}` : '/' }
		];

		if (isFromProductsPage) {
			crumbs.push({ 
				label: 'Productos', 
				href: categoryParam ? `/productos?category=${categoryParam}` : '/productos' 
			});
		}

		if (categoryParam && categoryParam in categoryLabels) {
			crumbs.push({ 
				label: categoryLabels[categoryParam], 
				href: isFromProductsPage 
					? `/productos?category=${categoryParam}` 
					: `/?category=${categoryParam}` 
			});
		}

		crumbs.push({ label: product.name, href: '' });
		return crumbs;
	});

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
			toast.error('Por favor selecciona una talla');
			return false;
		}
		if (product.colors.length > 0 && !selectedColor) {
			toast.error('Por favor selecciona un color');
			return false;
		}
		return true;
	}

	function handleAddToCart() {
		if (!validateSelections()) return;
		
		cartStore.addItem(product, quantity, selectedSize || null, selectedColor || null);
		toast.success('Producto agregado al carrito');
	}

	function handleGoToPay() {
		if (!validateSelections()) return;
		
		cartStore.addItem(product, quantity, selectedSize || null, selectedColor || null);
		// Aquí iría la lógica para ir directo al pago
		toast.success('Producto agregado al carrito y redirigiendo a pago...');
	}
</script>

<svelte:head>
	<title>{product.name} - Coco's</title>
	<meta name="description" content={product.description} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<ProductHeader 
		category={categoryParam || undefined}
		fromProductsPage={isFromProductsPage}
	/>

	<!-- Contenido principal -->
	<div class="max-w-7xl mx-auto px-4 py-8">
		<Breadcrumbs breadcrumbs={breadcrumbs()} />
		
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
