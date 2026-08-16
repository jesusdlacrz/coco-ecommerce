<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { SiteTestimonial } from '$lib/shared/services/siteContent.server';

	// Contenido de respaldo mientras no haya testimonios cargados en WordPress.
	const FALLBACK_TESTIMONIALS: SiteTestimonial[] = [
		{
			name: 'Ana María G.',
			role: 'Dueña de Boutique',
			quote:
				'"La calidad de los productos de Cocos superó nuestras expectativas. Desde que incluimos su catálogo en nuestra tienda, nuestras ventas y márgenes de ganancia han mejorado notablemente. ¡Totalmente recomendados!"',
			stars: 5,
			photo: null
		},
		{
			name: 'Daniel T.',
			role: 'Emprendedor Retail',
			quote:
				'"Nuestros clientes son muy exigentes con los acabados, y los materiales que maneja Cocos nos permiten ofrecer un producto de primera categoría sin inflar nuestros costos. Excelente inversión."',
			stars: 5,
			photo: null
		},
		{
			name: 'Diego R.',
			role: 'Distribuidor Mayorista',
			quote:
				'"Llevamos meses haciendo pedidos mayoristas y la puntualidad es impecable. Saber que los despachos llegan a tiempo y exactamente con lo que pedimos nos da muchísima tranquilidad."',
			stars: 5,
			photo: null
		},
		{
			name: 'Camila J.',
			role: 'Gerente de Compras',
			quote:
				'"Más que un proveedor, Cocos se ha convertido en un aliado estratégico para nuestro negocio. La atención personalizada y la facilidad para gestionar grandes volúmenes de compra hacen toda la diferencia."',
			stars: 5,
			photo: null
		}
	];

	let { testimonials: provided = [] }: { testimonials?: SiteTestimonial[] } = $props();

	const testimonials = $derived(provided.length ? provided : FALLBACK_TESTIMONIALS);

	let activeIndex = $state(1);
	const len = $derived(testimonials.length);

	function goPrev() {
		activeIndex = (activeIndex - 1 + len) % len;
	}
	function goNext() {
		activeIndex = (activeIndex + 1) % len;
	}

	function getOffset(i: number): number {
		const raw = ((i - activeIndex + len) % len);
		return raw > len / 2 ? raw - len : raw;
	}

	function initials(name: string): string {
		const words = name.trim().split(/\s+/).filter(Boolean);
		if (!words.length) return '?';
		if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
		return (words[0][0] + words[1][0]).toUpperCase();
	}
</script>

<section class="overflow-hidden py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Title -->
		<div class="mb-16 text-center">
			<h2 class="font-['Volkhov',serif] text-4xl text-[#262635]">Opiniones</h2>
			<p class="mt-3 text-sm text-[#8a8a8a]">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis
			</p>
		</div>

		<!-- Mobile: single card with fade on change -->
		<div class="md:hidden">
			{#key activeIndex}
				{@const t = testimonials[activeIndex]}
				<div
					in:fade={{ duration: 280 }}
					class="rounded-2xl bg-white p-6 shadow-[0px_20px_50px_0px_rgba(46,33,61,0.15)]"
				>
					<div class="mb-4 flex items-center gap-4">
						<div class="relative h-14 w-14 shrink-0">
							<div class="absolute -bottom-1 -right-1 h-full w-full rounded-sm bg-[#d9d9d9]"></div>
							<div class="relative h-full w-full overflow-hidden rounded-sm bg-[#d5d5d5]">
								{#if t.photo}
									<img src={t.photo} alt={t.name} class="h-full w-full object-cover" />
								{:else}
									<div class="flex h-full w-full items-center justify-center text-lg font-semibold text-[#8a8a8a]">
										{initials(t.name)}
									</div>
								{/if}
							</div>
						</div>
						<div>
							<p class="font-['Volkhov',serif] text-lg font-semibold text-[#262635]">{t.name}</p>
							<p class="text-sm text-[#8a8a8a]">{t.role}</p>
						</div>
					</div>
					<div class="mb-3 flex gap-1">
						{#each Array.from({ length: t.stars }, (_, i) => i) as si (si)}
							<svg class="h-4 w-4 text-[#e8a838]" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
							</svg>
						{/each}
					</div>
					<p class="text-sm leading-relaxed text-[#484848]">{t.quote}</p>
				</div>
			{/key}
		</div>

		<!-- Desktop: coverflow — all cards always in DOM, pure CSS transform transitions -->
		<div class="relative hidden place-items-center py-6 md:grid">
			{#each testimonials as t, i (t.name)}
				{@const offset = getOffset(i)}
				{@const isCenter = offset === 0}
				{@const isSide = Math.abs(offset) === 1}
				<button
					type="button"
					aria-label={isCenter ? t.name : `Ver opinión de ${t.name}`}
					onclick={() => { if (!isCenter) activeIndex = i; }}
					style="
						grid-area: 1 / 1;
						transform: translateX({offset * 63}%) scale({isCenter ? 1 : 0.87});
						opacity: {isCenter ? 1 : isSide ? 0.5 : 0};
						z-index: {isCenter ? 10 : isSide ? 5 : 0};
						pointer-events: {Math.abs(offset) <= 1 ? 'auto' : 'none'};
					"
					class="w-full max-w-[560px] overflow-hidden rounded-2xl bg-white transition-all duration-500 ease-in-out
						{isCenter
							? 'cursor-default shadow-[0px_20px_50px_0px_rgba(46,33,61,0.18)]'
							: 'cursor-pointer shadow-[0px_10px_30px_0px_rgba(46,33,61,0.08)]'}"
				>
					{#if isCenter}
						<div class="flex gap-6 p-8">
							<div class="shrink-0">
								<div class="relative h-[120px] w-[120px]">
									<div class="absolute -bottom-1.5 -right-1.5 h-full w-full rounded-sm bg-[#d9d9d9]"></div>
									<div class="relative h-full w-full overflow-hidden rounded-sm bg-[#d5d5d5]">
										{#if t.photo}
											<img src={t.photo} alt={t.name} class="h-full w-full object-cover" />
										{:else}
											<div class="flex h-full w-full items-center justify-center text-3xl font-semibold text-[#8a8a8a]">
												{initials(t.name)}
											</div>
										{/if}
									</div>
								</div>
							</div>
							<div class="flex flex-1 flex-col justify-between space-y-3">
								<div class="flex gap-1">
									{#each Array.from({ length: t.stars }, (_, j) => j) as si (si)}
										<svg class="h-4 w-4 text-[#e8a838]" fill="currentColor" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									{/each}
								</div>
								<p class="text-sm leading-relaxed text-[#484848]">{t.quote}</p>
								<div class="border-t border-[#c8c8c8] pt-3">
									<p class="font-['Volkhov',serif] text-lg font-semibold text-[#262635]">{t.name}</p>
									<p class="text-sm text-[#8a8a8a]">{t.role}</p>
								</div>
							</div>
						</div>
					{:else}
						<div class="flex gap-4 p-6">
							<div class="shrink-0">
								<div class="relative h-[48px] w-[48px]">
									<div class="absolute -bottom-1 -right-1 h-full w-full rounded-sm bg-[#d9d9d9]"></div>
									<div class="relative h-full w-full overflow-hidden rounded-sm bg-[#d5d5d5]">
										{#if t.photo}
											<img src={t.photo} alt={t.name} class="h-full w-full object-cover" />
										{:else}
											<div class="flex h-full w-full items-center justify-center text-xs font-semibold text-[#8a8a8a]">
												{initials(t.name)}
											</div>
										{/if}
									</div>
								</div>
							</div>
							<div class="flex-1 space-y-2">
								<div class="flex gap-0.5">
									{#each Array.from({ length: t.stars }, (_, j) => j) as si (si)}
										<svg class="h-3 w-3 text-[#e8a838]" fill="currentColor" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									{/each}
								</div>
								<p class="line-clamp-3 text-xs leading-relaxed text-[#484848]">{t.quote}</p>
								<div class="border-t border-[#c8c8c8] pt-2">
									<p class="font-['Volkhov',serif] text-base text-[#262635]">{t.name}</p>
									<p class="text-xs text-[#8a8a8a]">{t.role}</p>
								</div>
							</div>
						</div>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Arrows -->
		<div class="mt-10 flex justify-center gap-3">
			<button
				onclick={goPrev}
				class="flex h-10 w-10 items-center justify-center rounded-full border border-[#262635] text-[#262635] transition-all hover:bg-[#262635] hover:text-white"
				aria-label="Anterior"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			<button
				onclick={goNext}
				class="flex h-10 w-10 items-center justify-center rounded-full border border-[#262635] text-[#262635] transition-all hover:bg-[#262635] hover:text-white"
				aria-label="Siguiente"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		</div>
	</div>
</section>
