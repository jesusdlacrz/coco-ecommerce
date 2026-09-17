<script lang="ts">
	import { cartStore } from '$lib/cart/stores/cartStore';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { activeCategory, type Category } from '$lib/shared/stores/categoryStore';
	import { onMount } from 'svelte';
	import type { Product } from '$lib/shared/model/products';
	import { stockForCombo } from '$lib/shared/model/stock';
	import ImageGallery from '$lib/detailproducts/components/ImageGallery.svelte';
	import ProductInfo from '$lib/detailproducts/components/ProductInfo.svelte';
	import ProductOptions from '$lib/detailproducts/components/ProductOptions.svelte';
	import ProductActions from '$lib/detailproducts/components/ProductActions.svelte';
	import ProductDetails from '$lib/detailproducts/components/ProductDetails.svelte';
	import Breadcrumbs from '$lib/shared/components/Breadcrumbs.svelte';
	import { getCategoryStyle } from '$lib/products/filters/categoryStyles';
	import { HOUSE_STORE } from '$lib/storefront/model';
	import toast from 'svelte-5-french-toast';

	// La descripción viene de WordPress como HTML — el meta description debe
	// ser texto plano, no puede llevar las etiquetas tal cual.
	function stripHtml(html: string): string {
		return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
	}

	interface Props {
		product: Product;
	}

	let { product }: Props = $props();

	const store = $derived(page.data.storefront ?? HOUSE_STORE);

	// Obtener la categoría y origen desde los query parameters
	const categoryParam = $derived(page.url.searchParams.get('category'));

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

		const crumbs = [{ label: 'Inicio', href: store.basePath || '/' }];

		// Siempre mostrar el crumb de Productos para ir al catálogo completo
		crumbs.push({
			label: 'Productos',
			href: `${store.basePath}/productos`
		});

		if (categoryParam && categoryParam in categoryLabels) {
			crumbs.push({
				label: categoryLabels[categoryParam],
				href: `${store.basePath}/productos?category=${categoryParam}`
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

	// Al cambiar de talla/color el stock de la combinación puede ser menor que
	// la cantidad ya escrita; se ajusta en el momento en vez de dejar que el
	// usuario descubra el problema recién al agregar al carrito.
	function clampQuantityToStock() {
		const variations = product.variations ?? [];
		if (variations.length === 0) return;
		const needsSize = product.sizes.length > 0;
		const needsColor = product.colors.length > 0;
		if ((needsSize && !selectedSize) || (needsColor && !selectedColor)) return;
		const stock = stockForCombo(
			variations,
			needsSize ? selectedSize : null,
			needsColor ? selectedColor : null
		);
		if (stock > 0 && quantity > stock) quantity = stock;
	}

	function handleSizeSelect(size: string) {
		selectedSize = size;
		clampQuantityToStock();
	}

	function handleColorSelect(color: string) {
		selectedColor = color;
		clampQuantityToStock();
	}

	function handleQuantityChange(newQuantity: number) {
		quantity = newQuantity;
	}

	function handleImageSelect(index: number) {
		selectedImageIndex = index;
	}

	const validCategories: Category[] = ['men', 'women', 'boys', 'girls'];
	let effectiveCategory = $state<Category>('women');

	$effect(() => {
		const fromQuery = categoryParam as Category | null;
		if (fromQuery && validCategories.includes(fromQuery)) {
			effectiveCategory = fromQuery;
			return;
		}
		const fromProduct = (product as { gender?: Category })?.gender;
		effectiveCategory =
			fromProduct && validCategories.includes(fromProduct) ? fromProduct : 'women';
	});

	const currentStyle = $derived(getCategoryStyle(effectiveCategory));
	// El fondo sale de la misma fuente que el catálogo: antes la ficha de
	// Hombres se pintaba con el azul de Niños (#2C71CC33).
	const currentBackground = $derived(currentStyle.tint);

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
		// Defensa extra por si `quantity` quedó desincronizado (ej. el usuario
		// cambió de talla y el límite bajó) antes de llegar al carrito. El
		// checkout server-side es la validación real; esto solo evita un
		// mensaje confuso más adelante.
		const variations = product.variations ?? [];
		if (variations.length > 0) {
			const stock = stockForCombo(
				variations,
				product.sizes.length > 0 ? selectedSize : null,
				product.colors.length > 0 ? selectedColor : null
			);
			if (quantity > stock) {
				toast.error(
					stock > 0
						? `Solo quedan ${stock} unidades disponibles en esa combinación`
						: 'Esa combinación de talla/color está agotada'
				);
				return false;
			}
		}
		return true;
	}

	function handleAddToCart() {
		if (!validateSelections()) return;

		cartStore.addItem(product, quantity, selectedSize || null, selectedColor || null, store.slug);
		toast.success('Producto agregado al carrito');
	}

	function handleGoToPay() {
		if (!validateSelections()) return;

		cartStore.addItem(product, quantity, selectedSize || null, selectedColor || null, store.slug);
		// Mismo destino que el botón de pagar del carrito: `/carrito` es la
		// página de checkout.
		goto(`${store.basePath}/carrito`);
	}
</script>

<svelte:head>
	<title>{product.name} - {store.name}</title>
	<meta name="description" content={stripHtml(product.description)} />
</svelte:head>

<div class="min-h-screen {currentBackground} transition-colors duration-700">
	<!-- Contenido principal -->
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<Breadcrumbs breadcrumbs={breadcrumbs()} />

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Galería de imágenes -->
			<ImageGallery
				images={product.images}
				srcsets={product.imageSrcsets}
				productName={product.name}
				{selectedImageIndex}
				onImageSelect={handleImageSelect}
				accentColor={currentStyle.accentColor}
			/>

			<!-- Información y opciones del producto -->
			<div class="space-y-6">
				<ProductInfo {product} />

				<ProductOptions
					sizes={product.sizes}
					colors={product.colors}
					variations={product.variations ?? []}
					{selectedSize}
					{selectedColor}
					{quantity}
					onSizeSelect={handleSizeSelect}
					onColorSelect={handleColorSelect}
					onQuantityChange={handleQuantityChange}
				/>

				<ProductActions onAddToCart={handleAddToCart} onBuyNow={handleGoToPay} />

				<ProductDetails {product} />
			</div>
		</div>
	</div>
</div>
