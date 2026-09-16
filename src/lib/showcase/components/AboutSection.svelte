<script lang="ts">
	import { fade } from 'svelte/transition';
	import IconButton from '$lib/shared/components/form/IconButton.svelte';
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
		<h2 class="mb-16 text-center font-display text-4xl text-ink">Nosotros</h2>

		<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
			<!-- Left: text with vertical accent line -->
			<div class="border-l border-muted-faint pl-8">
				{#key current}
					<div in:fade={{ duration: 300 }}>
						<h3 class="mb-5 font-display text-2xl text-ink">
							{slides[current].heading}
						</h3>
						{#each slides[current].body as paragraph, pi (pi)}
							<p class="mb-4 leading-relaxed text-muted-soft">{paragraph}</p>
						{/each}
					</div>
				{/key}

				<!-- Nav arrows -->
				<div class="mt-6 flex gap-3">
					<IconButton label="Anterior" size="sm" onclick={goPrev}>
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</IconButton>
					<IconButton label="Siguiente" size="sm" onclick={goNext}>
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</IconButton>
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
