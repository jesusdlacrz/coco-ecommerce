<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Product } from '$lib/shared/model/products';
	import type { SiteCopy } from '$lib/shared/services/siteContent.server';
	import { formatPrice } from '$lib/shared/utils/price';
	import IconButton from '$lib/shared/components/form/IconButton.svelte';
	import CarouselDots from '$lib/shared/components/CarouselDots.svelte';
	import Button from '$lib/shared/components/form/Button.svelte';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';

	const DEFAULT_TITLE = 'Lo Más Nuevo';
	const DEFAULT_TEXT =
		'Las prendas que acaban de llegar a bodega. Precios por mayor desde 4 unidades, listas para despachar a todo el país.';

	// Los productos más recientes de WooCommerce (los primeros que llegan del load).
	let { products = [], copy = null }: { products?: Product[]; copy?: SiteCopy | null } = $props();

	const title = $derived(copy?.newArrivalsTitle || DEFAULT_TITLE);
	const text = $derived(copy?.newArrivalsText || DEFAULT_TEXT);

	const store = $derived(page.data.storefront ?? HOUSE_STORE);

	const MAX_SLIDES = 6;

	function priceTag(product: Product): string {
		// En una tienda mayorista el "descuento" es el ahorro del precio mayorista.
		if (product.wholesalePrice && product.wholesalePrice < product.price) {
			const pct = Math.round(((product.price - product.wholesalePrice) / product.price) * 100);
			return `${pct}% OFF`;
		}
		return formatPrice(product.price);
	}

	const slides = $derived(
		products.slice(0, MAX_SLIDES).map((product, i) => ({
			label: String(i + 1).padStart(2, '0'),
			sale: product.name,
			discount: priceTag(product),
			image: product.images[0] ?? '/placeholder.svg',
			alt: product.name
		}))
	);

	// Desktop: current index + direction for transition
	let current = $state(0);
	let direction = $state(1); // 1 = forward, -1 = backward
	const nextIdx = $derived(slides.length ? (current + 1) % slides.length : 0);

	function goPrev() {
		if (!slides.length) return;
		direction = -1;
		current = (current - 1 + slides.length) % slides.length;
	}
	function goNext() {
		if (!slides.length) return;
		direction = 1;
		current = (current + 1) % slides.length;
	}

	// Mobile & Tablet: separate active index tracked by IntersectionObserver
	let mobileActive = $state(0);
	let tabletActive = $state(0);

	let mobileCarousel = $state<HTMLElement | null>(null);
	let tabletCarousel = $state<HTMLElement | null>(null);

	function setupObserver(container: HTMLElement, onActive: (i: number) => void) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const idx = parseInt((entry.target as HTMLElement).dataset.index ?? '0');
						onActive(idx);
					}
				});
			},
			{ root: container, threshold: 0.6 }
		);
		container.querySelectorAll('[data-index]').forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}

	function scrollToSlide(container: HTMLElement, index: number) {
		container.scrollTo({ left: index * container.clientWidth, behavior: 'smooth' });
	}

	onMount(() => {
		let cleanMobile: (() => void) | undefined;
		let cleanTablet: (() => void) | undefined;

		if (mobileCarousel) {
			cleanMobile = setupObserver(mobileCarousel, (i) => (mobileActive = i));
		}
		if (tabletCarousel) {
			cleanTablet = setupObserver(tabletCarousel, (i) => (tabletActive = i));
		}
		return () => {
			cleanMobile?.();
			cleanTablet?.();
		};
	});
</script>

<section class="overflow-hidden bg-gradient-to-b from-[#FCA12054] to-transparent">
	{#if slides.length}
		<!-- ===================== DESKTOP (lg+) ===================== -->
		<div
			class="mx-auto hidden overflow-hidden px-4 sm:px-6 lg:flex lg:px-8"
			style="height: 680px; max-width: 80rem;"
		>
			<!-- Col 1: Text — fluid, up to 460px -->
			<div class="flex max-w-[460px] min-w-[220px] flex-[2] flex-col justify-center gap-5 pr-6">
				<h2 class="font-display text-4xl leading-tight text-ink xl:text-5xl">
					{title}
				</h2>
				<p class="leading-relaxed text-muted-soft">{text}</p>
				<Button
					variant="secondary"
					href="{store.basePath}/productos"
					class="w-fit shadow-[0px_20px_35px_0px_rgba(0,0,0,0.15)]"
				>
					Comprar
				</Button>
			</div>

			<!-- Col 2: Arrows — fixed narrow -->
			<div class="mr-6 flex w-20 shrink-0 flex-row items-end justify-center gap-2 pb-[60px]">
				<IconButton label="Anterior" onclick={goPrev}>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/></svg
					>
				</IconButton>
				<IconButton label="Siguiente" onclick={goNext}>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/></svg
					>
				</IconButton>
			</div>

			<!-- Col 3: Cards — fluid, fills remaining space -->
			<div class="flex flex-1 items-start gap-4 pt-10 pr-4 pb-8">
				<!-- Main card: keyed so fly transition fires on change -->
				<div
					class="relative min-w-0 flex-[11] overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-[0px_4px_35px_0px_rgba(0,0,0,0.15)]"
					style="height:580px"
				>
					{#key current}
						<div
							class="h-full w-full"
							in:fly={{ x: direction * -60, duration: 380, easing: cubicOut, opacity: 0 }}
						>
							<img
								src={slides[current].image}
								alt={slides[current].alt}
								class="h-full w-full object-cover"
							/>
						</div>
					{/key}
					<div class="absolute bottom-0 left-0 w-52 bg-white/90 px-5 py-4 backdrop-blur-sm">
						{#key current}
							<div in:fade={{ duration: 250, delay: 100 }}>
								<p class="text-sm text-muted">
									{slides[current].label} — {slides[current].sale}
								</p>
								<p class="mt-1 text-2xl font-medium text-muted">{slides[current].discount}</p>
							</div>
						{/key}
					</div>
				</div>
				<!-- Secondary card (peek): click advances to next -->
				<div class="flex min-w-0 flex-[10] flex-col gap-4">
					<button
						onclick={goNext}
						class="w-full cursor-pointer overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-[0px_4px_35px_0px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.02]"
						style="height:520px"
						aria-label="Ver siguiente"
					>
						{#key nextIdx}
							<img
								src={slides[nextIdx].image}
								alt={slides[nextIdx].alt}
								class="h-full w-full object-cover"
								in:fade={{ duration: 300 }}
							/>
						{/key}
					</button>
					<CarouselDots
						count={slides.length}
						active={current}
						onSelect={(i) => {
							direction = i > current ? 1 : -1;
							current = i;
						}}
					/>
				</div>
			</div>
		</div>

		<!-- ===================== TABLET (md → lg) ===================== -->
		<div class="hidden flex-col py-14 md:flex lg:hidden xl:py-20">
			<div class="space-y-4 px-8 text-center">
				<h2 class="font-display text-5xl leading-tight text-ink">{title}</h2>
				<p class="mx-auto max-w-md leading-relaxed text-muted-soft">{text}</p>
				<Button variant="secondary" href="{store.basePath}/productos" class="shadow-lg">
					Comprar
				</Button>
			</div>

			<!-- Carousel: capped width so cards keep portrait proportions -->
			<div class="mt-10 flex justify-center">
				<div
					bind:this={tabletCarousel}
					class="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					style="width: min(420px, 90vw);"
				>
					{#each slides as slide, i (slide.label)}
						<div
							data-index={i}
							class="relative shrink-0 snap-center overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-lg"
							style="width:min(420px,90vw);height:500px;flex-shrink:0"
						>
							<img src={slide.image} alt={slide.alt} class="h-full w-full object-cover" />
							<div class="absolute bottom-0 left-0 w-52 bg-white/90 px-5 py-4 backdrop-blur-sm">
								<p class="text-sm text-muted">{slide.label} — {slide.sale}</p>
								<p class="mt-1 text-2xl font-medium text-muted">{slide.discount}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Arrows + Dots: functional, below carousel -->
			<div class="mt-8 flex items-center justify-center gap-4">
				<IconButton
					label="Anterior"
					onclick={() =>
						tabletCarousel &&
						scrollToSlide(tabletCarousel, (tabletActive - 1 + slides.length) % slides.length)}
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</IconButton>

				<CarouselDots
					count={slides.length}
					active={tabletActive}
					onSelect={(i) => tabletCarousel && scrollToSlide(tabletCarousel, i)}
				/>

				<IconButton
					label="Siguiente"
					onclick={() =>
						tabletCarousel && scrollToSlide(tabletCarousel, (tabletActive + 1) % slides.length)}
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</IconButton>
			</div>
		</div>

		<!-- ===================== MÓVIL (< md) — Instagram style ===================== -->
		<div class="flex flex-col py-14 md:hidden">
			<div class="space-y-4 px-6 text-center">
				<h2 class="font-display text-4xl leading-tight text-ink">{title}</h2>
				<p class="mx-auto max-w-xs leading-relaxed text-muted-soft">{text}</p>
				<Button variant="secondary" href="{store.basePath}/productos" class="shadow-lg">
					Comprar
				</Button>
			</div>

			<!-- 100% width snap carousel — no arrows -->
			<div
				bind:this={mobileCarousel}
				class="mt-8 flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				{#each slides as slide, i (slide.label)}
					<div
						data-index={i}
						class="relative overflow-hidden bg-[#d5d5d5]"
						style="width:100%;height:420px;flex-shrink:0;scroll-snap-align:center"
					>
						<img src={slide.image} alt={slide.alt} class="h-full w-full object-cover" />
						<div class="absolute bottom-0 left-0 w-48 bg-white/90 px-4 py-3 backdrop-blur-sm">
							<p class="text-xs text-muted">{slide.label} — {slide.sale}</p>
							<p class="mt-1 text-xl font-medium text-muted">{slide.discount}</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- Dots only — no arrows on mobile -->
			<div class="mt-4">
				<CarouselDots
					count={slides.length}
					active={mobileActive}
					onSelect={(i) => mobileCarousel && scrollToSlide(mobileCarousel, i)}
				/>
			</div>
		</div>
	{/if}
</section>
