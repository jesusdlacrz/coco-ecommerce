<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { SiteAboutSlide } from '$lib/shared/services/siteContent.server';

	// Contenido de respaldo mientras no haya slides cargados en WordPress.
	const FALLBACK_SLIDES: SiteAboutSlide[] = [
		{
			heading: 'Nuestra Misión',
			body: [
				'Nuestra misión es impulsar el crecimiento de los negocios de moda proporcionando prendas de alta calidad a precios altamente competitivos. Buscamos ser el proveedor de confianza que facilite el éxito de tu tienda.',
				'Nos esforzamos por actualizar constantemente nuestro catálogo, asegurando que siempre tengas acceso a las últimas tendencias del mercado con un servicio ágil, cercano y sin complicaciones.'
			],
			image: null
		},
		{
			heading: 'Nuestra Historia',
			body: [
				'Cocos nació de la pasión por la moda y el compromiso con la calidad. Desde nuestros inicios, hemos trabajado con los mejores proveedores para ofrecer prendas que combinan estilo y durabilidad.',
				'Hoy somos aliados estratégicos de cientos de boutiques y emprendedores en toda la región, respaldados por años de experiencia mayorista.'
			],
			image: null
		},
		{
			heading: 'Nuestros Valores',
			body: [
				'La honestidad, la puntualidad y el servicio personalizado son los pilares de cada pedido que despachamos. Creemos que la confianza se construye con cada entrega.',
				'Nos comprometemos a mantener los más altos estándares de calidad para que tu negocio siempre tenga lo mejor que ofrecer.'
			],
			image: null
		}
	];

	const IMAGE_FALLBACK = '/placeholder.svg?height=600&width=480';

	let { slides: provided = [] }: { slides?: SiteAboutSlide[] } = $props();

	const slides = $derived(provided.length ? provided : FALLBACK_SLIDES);

	let current = $state(0);
	const len = $derived(slides.length);

	function goPrev() {
		current = (current - 1 + len) % len;
	}
	function goNext() {
		current = (current + 1) % len;
	}
</script>

<section class="py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<h2 class="mb-16 text-center font-['Volkhov',serif] text-4xl text-[#262635]">Nosotros</h2>

		<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
			<!-- Left: text with vertical accent line -->
			<div class="border-l border-[#a0a0a0] pl-8">
				{#key current}
					<div in:fade={{ duration: 300 }}>
						<h3 class="mb-5 font-['Volkhov',serif] text-2xl text-[#262635]">
							{slides[current].heading}
						</h3>
						{#each slides[current].body as paragraph, pi (pi)}
							<p class="mb-4 leading-relaxed text-[#767676]">{paragraph}</p>
						{/each}
					</div>
				{/key}

				<!-- Nav arrows -->
				<div class="mt-6 flex gap-3">
					<button
						onclick={goPrev}
						class="flex h-9 w-9 items-center justify-center rounded-full border border-[#c0c0c0] text-[#484848] transition-all hover:border-[#262635] hover:bg-[#262635] hover:text-white"
						aria-label="Anterior"
					>
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<button
						onclick={goNext}
						class="flex h-9 w-9 items-center justify-center rounded-full border border-[#c0c0c0] text-[#484848] transition-all hover:border-[#262635] hover:bg-[#262635] hover:text-white"
						aria-label="Siguiente"
					>
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			</div>

			<!-- Right: portrait image -->
			<div class="flex justify-center lg:justify-end">
				<div class="w-full max-w-[480px] overflow-hidden rounded-2xl shadow-2xl">
					<img
						src={slides[current]?.image ?? IMAGE_FALLBACK}
						alt={slides[current]?.heading ?? 'Nosotros'}
						class="h-[480px] w-full object-cover lg:h-[540px]"
					/>
				</div>
			</div>
		</div>
	</div>
</section>
