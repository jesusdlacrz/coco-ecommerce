<script lang="ts">
	import type { Product } from '$lib/shared/model/products';
	import type { SiteCopy, SiteHeroImages } from '$lib/shared/services/siteContent.server';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';
	import Button from '$lib/shared/components/form/Button.svelte';

	// Productos recientes de WooCommerce para las imágenes del hero, salvo que
	// se haya subido una imagen personalizada en WordPress para esa posición.
	let {
		products = [],
		copy = null,
		heroImages = null,
		srcsets = {}
	}: {
		products?: Product[];
		copy?: SiteCopy | null;
		heroImages?: SiteHeroImages | null;
		srcsets?: Record<string, string>;
	} = $props();

	const line1 = $derived(copy?.offerLine1 || 'GRAN');
	const line2 = $derived(copy?.offerLine2 || 'OFERTA');
	const subtitle = $derived(copy?.offerSubtitle || 'NUEVA COLECCIÓN');

	const store = $derived(page.data.storefront ?? HOUSE_STORE);

	const PLACEHOLDER = '/placeholder.svg';

	function image(
		override: string | null | undefined,
		productIndex: number
	): { src: string; srcset?: string; alt: string } {
		// La imagen del catálogo trae su `srcset` en la respuesta de WooCommerce;
		// la subida a mano no, y hay que buscarla en la biblioteca de medios.
		// Sin él, el móvil se descargaba el original (1295 px) para pintar una
		// columna de 164.
		if (override) return { src: override, srcset: srcsets[override], alt: 'Gran Oferta' };
		const product = products[productIndex];
		return {
			src: product?.images[0] ?? PLACEHOLDER,
			srcset: product?.imageSrcsets?.[0] || undefined,
			alt: product?.name ?? 'Producto destacado'
		};
	}

	const left = $derived(image(heroImages?.left, 0));
	const center = $derived(image(heroImages?.center, 1));
	const right = $derived(image(heroImages?.right, 2));
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<!-- Una sola rejilla para las dos disposiciones.
	     Antes había dos juegos de marcado: las imágenes laterales se escribían
	     una vez para escritorio (`lg:block`) y otra para móvil (`lg:hidden`),
	     así que las MISMAS dos fotos estaban dos veces en el DOM y el navegador
	     las descargaba por duplicado en cada carga. Aquí cada imagen aparece una
	     sola vez y solo cambia dónde se coloca. -->
	<div
		class="grid grid-cols-2 gap-4 lg:grid-cols-[1fr_1.5fr_1fr] lg:items-start lg:gap-6"
	>
		<!-- Columna central: en móvil va primera y ocupa el ancho completo. -->
		<div
			class="order-1 col-span-2 flex flex-col items-center lg:order-none lg:col-span-1 lg:col-start-2 lg:row-start-1"
		>
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
						class="bg-gradient-to-r from-accent via-yellow-500 to-accent-hover bg-clip-text font-bold tracking-tight text-transparent"
						style="font-size: clamp(3rem, 8vw, 6.5rem); line-height: 1;"
					>
						{line2}
					</h2>
					<p class="mt-3 text-sm font-medium tracking-[3px] text-muted uppercase lg:text-base">
						{subtitle}
					</p>
				</div>
				<Button
					variant="secondary"
					href="{store.basePath}/productos"
					class="shadow-raised"
				>
					Comprar ahora
				</Button>
			</div>

			<div class="order-2 aspect-[3/1] w-full overflow-hidden rounded-2xl bg-graybrand shadow-lg lg:order-1">
				<img
					src={center.src}
					srcset={center.srcset}
					sizes="(min-width: 1024px) 700px, 100vw"
					alt={center.alt}
					fetchpriority="high"
					decoding="async"
					class="h-full w-full object-cover"
				/>
			</div>
		</div>

		<!-- Laterales: debajo del bloque central en móvil, a los costados en lg. -->
		<div
			class="order-2 aspect-[1/2] w-full overflow-hidden rounded-2xl bg-graybrand shadow-lg lg:order-none lg:col-start-1 lg:row-start-1"
		>
			<img
				src={left.src}
				srcset={left.srcset}
				sizes="(min-width: 1024px) 320px, 50vw"
				alt={left.alt}
				decoding="async"
				class="h-full w-full object-cover object-top"
			/>
		</div>
		<div
			class="order-3 aspect-[1/2] w-full overflow-hidden rounded-2xl bg-graybrand shadow-lg lg:order-none lg:col-start-3 lg:row-start-1"
		>
			<img
				src={right.src}
				srcset={right.srcset}
				sizes="(min-width: 1024px) 320px, 50vw"
				alt={right.alt}
				decoding="async"
				class="h-full w-full object-cover object-top"
			/>
		</div>
	</div>
</div>
