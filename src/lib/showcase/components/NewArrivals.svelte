<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	const slides = [
		{ label: '01', sale: 'Spring Sale', discount: '30% OFF', image: '/placeholder.svg?height=580&width=404', alt: 'Spring Sale' },
		{ label: '02', sale: 'Summer Collection', discount: '20% OFF', image: '/placeholder.svg?height=580&width=404', alt: 'Summer' },
		{ label: '03', sale: 'Invierno', discount: '15% OFF', image: '/placeholder.svg?height=580&width=404', alt: 'Invierno' },
		{ label: '04', sale: 'Otoño', discount: '25% OFF', image: '/placeholder.svg?height=580&width=404', alt: 'Otoño' }
	];

	// Desktop: current index + direction for transition
	let current = $state(0);
	let direction = $state(1); // 1 = forward, -1 = backward
	const nextIdx = $derived((current + 1) % slides.length);

	function goPrev() {
		direction = -1;
		current = (current - 1 + slides.length) % slides.length;
	}
	function goNext() {
		direction = 1;
		current = (current + 1) % slides.length;
	}

	// Mobile & Tablet: separate active index tracked by IntersectionObserver
	let mobileActive = $state(0);
	let tabletActive = $state(0);

	let mobileCarousel: HTMLElement | null = null;
	let tabletCarousel: HTMLElement | null = null;

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

	<!-- ===================== DESKTOP (lg+) ===================== -->
	<div class="mx-auto hidden overflow-hidden lg:flex px-4 sm:px-6 lg:px-8" style="height: 680px; max-width: 80rem;">

		<!-- Col 1: Text — fluid, up to 460px -->
		<div class="flex min-w-[220px] max-w-[460px] flex-[2] flex-col justify-center gap-5 pr-6">
			<h2 class="font-['Volkhov',serif] text-4xl leading-tight text-[#262635] xl:text-5xl">Lo Más Nuevo</h2>
			<p class="leading-relaxed text-[#8a8a8a]">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis ultrices
				sollicitudin aliquam sem. Scelerisque duis ultrices sollicitudin
			</p>
			<a href="/productos" class="inline-block w-fit rounded-xl bg-[#262635] px-8 py-3 text-sm font-medium text-white shadow-[0px_20px_35px_0px_rgba(0,0,0,0.15)] transition-all hover:bg-[#3a3a4d] xl:px-10 xl:py-4">
				Comprar
			</a>
		</div>

		<!-- Col 2: Arrows — fixed narrow -->
		<div class="flex w-20 shrink-0 flex-row items-end justify-center gap-2 pb-[60px] mr-6">
			<button onclick={goPrev} class="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8c8c8] bg-white text-[#484848] shadow-sm transition-all hover:border-[#262635] hover:bg-[#262635] hover:text-white" aria-label="Anterior">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
			</button>
			<button onclick={goNext} class="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8c8c8] bg-white text-[#484848] shadow-sm transition-all hover:border-[#262635] hover:bg-[#262635] hover:text-white" aria-label="Siguiente">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
			</button>
		</div>

		<!-- Col 3: Cards — fluid, fills remaining space -->
		<div class="flex flex-1 items-start gap-4 pt-10 pb-8 pr-4">
			<!-- Main card: keyed so fly transition fires on change -->
			<div class="relative min-w-0 flex-[11] overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-[0px_4px_35px_0px_rgba(0,0,0,0.15)]" style="height:580px">
				{#key current}
					<div
						class="h-full w-full"
						in:fly={{ x: direction * -60, duration: 380, easing: cubicOut, opacity: 0 }}
					>
						<img src={slides[current].image} alt={slides[current].alt} class="h-full w-full object-cover" />
					</div>
				{/key}
				<div class="absolute bottom-0 left-0 w-52 bg-white/90 px-5 py-4 backdrop-blur-sm">
					{#key current}
						<div in:fade={{ duration: 250, delay: 100 }}>
							<p class="text-sm text-[#484848]">{slides[current].label} — {slides[current].sale}</p>
							<p class="mt-1 text-2xl font-medium text-[#484848]">{slides[current].discount}</p>
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
				<div class="flex justify-center gap-2">
					{#each slides as slide, i (slide.label)}
						<button onclick={() => { direction = i > current ? 1 : -1; current = i; }} class="rounded-full transition-all duration-300 {i === current ? 'h-3 w-8 bg-[#262635]' : 'h-3 w-3 bg-[#c8c8c8]'}" aria-label="Slide {i+1}"></button>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- ===================== TABLET (md → lg) ===================== -->
	<div class="hidden flex-col py-14 md:flex lg:hidden">

		<div class="space-y-4 px-8 text-center">
			<h2 class="font-['Volkhov',serif] text-5xl leading-tight text-[#262635]">Lo Más Nuevo</h2>
			<p class="mx-auto max-w-md leading-relaxed text-[#8a8a8a]">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis ultrices
				sollicitudin aliquam sem. Scelerisque duis ultrices sollicitudin
			</p>
			<a href="/productos" class="inline-block rounded-xl bg-[#262635] px-10 py-4 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#3a3a4d]">
				Comprar
			</a>
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
							<p class="text-sm text-[#484848]">{slide.label} — {slide.sale}</p>
							<p class="mt-1 text-2xl font-medium text-[#484848]">{slide.discount}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Arrows + Dots: functional, below carousel -->
		<div class="mt-8 flex items-center justify-center gap-4">
			<button
				onclick={() => tabletCarousel && scrollToSlide(tabletCarousel, (tabletActive - 1 + slides.length) % slides.length)}
				class="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8c8c8] bg-white text-[#484848] shadow-sm transition-all hover:border-[#262635] hover:bg-[#262635] hover:text-white"
				aria-label="Anterior"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
			</button>

			<div class="flex gap-2">
				{#each slides as slide, i (slide.label)}
					<button
						onclick={() => tabletCarousel && scrollToSlide(tabletCarousel, i)}
						class="rounded-full transition-all duration-300 {i === tabletActive ? 'h-3 w-8 bg-[#262635]' : 'h-3 w-3 bg-[#c8c8c8]'}"
						aria-label="Slide {i+1}"
					></button>
				{/each}
			</div>

			<button
				onclick={() => tabletCarousel && scrollToSlide(tabletCarousel, (tabletActive + 1) % slides.length)}
				class="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8c8c8] bg-white text-[#484848] shadow-sm transition-all hover:border-[#262635] hover:bg-[#262635] hover:text-white"
				aria-label="Siguiente"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
			</button>
		</div>
	</div>

	<!-- ===================== MÓVIL (< md) — Instagram style ===================== -->
	<div class="flex flex-col py-12 md:hidden">

		<div class="space-y-4 px-6 text-center">
			<h2 class="font-['Volkhov',serif] text-4xl leading-tight text-[#262635]">Lo Más Nuevo</h2>
			<p class="mx-auto max-w-xs leading-relaxed text-[#8a8a8a]">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis ultrices sollicitudin aliquam sem.
			</p>
			<a href="/productos" class="inline-block rounded-xl bg-[#262635] px-10 py-4 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#3a3a4d]">
				Comprar
			</a>
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
					style="width:100vw;height:420px;flex-shrink:0;scroll-snap-align:center"
				>
					<img src={slide.image} alt={slide.alt} class="h-full w-full object-cover" />
					<div class="absolute bottom-0 left-0 w-48 bg-white/90 px-4 py-3 backdrop-blur-sm">
						<p class="text-xs text-[#484848]">{slide.label} — {slide.sale}</p>
						<p class="mt-1 text-xl font-medium text-[#484848]">{slide.discount}</p>
					</div>
				</div>
			{/each}
		</div>

		<!-- Dots only — no arrows on mobile -->
		<div class="mt-4 flex justify-center gap-2">
			{#each slides as slide, i (slide.label)}
				<button
					onclick={() => mobileCarousel && scrollToSlide(mobileCarousel, i)}
					class="rounded-full transition-all duration-300 {i === mobileActive ? 'h-3 w-8 bg-[#262635]' : 'h-3 w-3 bg-[#c8c8c8]'}"
					aria-label="Slide {i+1}"
				></button>
			{/each}
		</div>
	</div>

</section>
