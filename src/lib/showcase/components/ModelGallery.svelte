<script lang="ts">
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';
	import type { Product } from '$lib/shared/model/products';
	import type { SiteCopy, SiteHeroImages } from '$lib/shared/services/siteContent.server';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';

	// Productos recientes de WooCommerce para las imágenes del hero, salvo que
	// se haya subido una imagen personalizada en WordPress para esa posición.
	let {
		products = [],
		copy = null,
		heroImages = null
	}: { products?: Product[]; copy?: SiteCopy | null; heroImages?: SiteHeroImages | null } =
		$props();

	const line1 = $derived(copy?.offerLine1 || 'GRAN');
	const line2 = $derived(copy?.offerLine2 || 'OFERTA');
	const subtitle = $derived(copy?.offerSubtitle || 'NUEVA COLECCIÓN');

	const store = $derived(page.data.storefront ?? HOUSE_STORE);

	const PLACEHOLDER = '/placeholder.svg';

	function image(
		override: string | null | undefined,
		productIndex: number
	): { src: string; alt: string } {
		if (override) return { src: override, alt: 'Gran Oferta' };
		const product = products[productIndex];
		return {
			src: product?.images[0] ?? PLACEHOLDER,
			alt: product?.name ?? 'Producto destacado'
		};
	}

	const left = $derived(image(heroImages?.left, 0));
	const center = $derived(image(heroImages?.center, 1));
	const right = $derived(image(heroImages?.right, 2));
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<!-- MÓVIL: flex-col con reordenamiento. ESCRITORIO: grid 3 columnas -->
	<div
		class="flex flex-col gap-5 lg:grid lg:items-start lg:gap-6"
		style="grid-template-columns: 1fr 1.5fr 1fr;"
	>
		<!-- Imagen izquierda — oculta en móvil, aparece en lg (col 1, row 1) -->
		<div
			class="hidden w-full overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-lg lg:block"
			style="aspect-ratio: 1/2; grid-column: 1; grid-row: 1;"
		>
			<img src={left.src} alt={left.alt} class="h-full w-full object-cover object-top" />
		</div>

		<!-- Columna central — en lg ocupa col 2, row 1 -->
		<div class="flex flex-col items-center" style="grid-column: 2; grid-row: 1;">
			<!-- Texto + botón: order-1 en móvil (va primero), luego imagen -->
			<div
				class="order-1 flex flex-col items-center gap-5 py-6 text-center font-poppins lg:order-2 lg:mt-8 lg:py-0"
			>
				<div>
					<h1
						class="font-bold tracking-tight text-muted"
						style="font-size: clamp(2rem, 5vw, 4rem); line-height: 1.1;"
					>
						{line1}
					</h1>
					<h2
						class="bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-500 bg-clip-text font-bold tracking-tight text-transparent"
						style="font-size: clamp(3rem, 8vw, 6.5rem); line-height: 1;"
					>
						{line2}
					</h2>
					<p class="mt-3 text-sm font-medium tracking-[3px] text-muted uppercase lg:text-base">
						{subtitle}
					</p>
				</div>
				<TransitionLink
					href="{store.basePath}/productos"
					hero={false}
					class="inline-block rounded-xl bg-black px-10 py-4 text-sm font-medium text-white shadow-[0px_20px_35px_0px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-xl"
				>
					Comprar ahora
				</TransitionLink>
			</div>

			<!-- Imagen horizontal: order-2 en móvil (va después del texto) -->
			<div
				class="order-2 w-full overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-lg lg:order-1"
				style="aspect-ratio: 3/1;"
			>
				<img src={center.src} alt={center.alt} class="h-full w-full object-cover" />
			</div>
		</div>

		<!-- Imagen derecha — oculta en móvil en lg, col 3, row 1 -->
		<div
			class="hidden w-full overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-lg lg:block"
			style="aspect-ratio: 1/2; grid-column: 3; grid-row: 1;"
		>
			<img src={right.src} alt={right.alt} class="h-full w-full object-cover object-top" />
		</div>

		<!-- Sub-grid de imágenes laterales para móvil (order-3, visible solo en < lg) -->
		<div class="order-3 grid grid-cols-2 gap-3 lg:hidden">
			<div class="overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-lg" style="aspect-ratio: 1/2;">
				<img src={left.src} alt={left.alt} class="h-full w-full object-cover object-top" />
			</div>
			<div class="overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-lg" style="aspect-ratio: 1/2;">
				<img src={right.src} alt={right.alt} class="h-full w-full object-cover object-top" />
			</div>
		</div>
	</div>
</div>
