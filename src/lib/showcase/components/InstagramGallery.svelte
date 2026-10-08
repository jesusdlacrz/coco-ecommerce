<script lang="ts">
	import type { SiteInstagramImage } from '$lib/shared/services/siteContent.server';
	import type { SiteInstagramProfile } from '$lib/shared/services/siteExtras.server';
	import Instagram from '$lib/shared/icons/Instagram.svelte';

	// Valores originales: se usan para cada campo que quede vacío en WordPress.
	const DEFAULT_URL = 'https://www.instagram.com/cocos.bodegaderopa?igsi=d3p0aHVmMHhzb3h5';
	const DEFAULT_HANDLE = 'cocos.bodegaderopa';
	const DEFAULT_TEXT = 'Mira las últimas prendas, looks y novedades directamente en nuestra cuenta.';
	const PLACEHOLDER = '/placeholder.svg?height=500&width=400';

	const FALLBACK_IMAGES: SiteInstagramImage[] = Array.from({ length: 4 }, (_, i) => ({
		src: null,
		alt: `foto ${i + 1}`
	}));

	let {
		images: provided = [],
		srcsets = {},
		profile = null
	}: {
		images?: SiteInstagramImage[];
		srcsets?: Record<string, string>;
		profile?: SiteInstagramProfile | null;
	} = $props();

	const images = $derived(provided.length ? provided : FALLBACK_IMAGES);

	// El usuario se acepta con o sin "@". Si cambian el usuario pero no el
	// enlace, el enlace se arma a partir del usuario nuevo.
	const handle = $derived(profile?.handle.trim().replace(/^@/, '') || DEFAULT_HANDLE);
	const instagramUrl = $derived(
		profile?.url.trim() ||
			(handle === DEFAULT_HANDLE ? DEFAULT_URL : `https://www.instagram.com/${handle}`)
	);
	const text = $derived(profile?.text.trim() || DEFAULT_TEXT);
</script>

<section class="py-20">
	<div class="mb-12 text-center">
		<a
			href={instagramUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-block transition-opacity hover:opacity-70"
			aria-label="Ver Coco's en Instagram (se abre en una pestaña nueva)"
		>
			<!-- Ícono arriba y centrado: si el título pasa a dos líneas en móvil, no
			     queda descolgado respecto a una de ellas. -->
			<Instagram class="mx-auto mb-3 h-8 w-8 text-accent" />
			<h2 class="font-display text-3xl text-ink sm:text-4xl">Síguenos en Instagram</h2>
		</a>
		<p class="mt-2 font-poppins text-sm text-muted-soft">@{handle}</p>
		<p class="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-soft">
			{text}
		</p>
	</div>

	<div class="relative">
		<!-- Tira a sangre, sin separación entre fotos.
		     Una sola lista para las dos disposiciones: deslizable en móvil y
		     ajustada al ancho desde tablet. Antes el mismo juego de fotos estaba
		     escrito tres veces en el marcado, una por punto de ruptura.

		     Desde tablet es UNA sola fila que reparte el ancho a partes iguales
		     (`flex-1`): con 4 fotos son 4 columnas anchas, con 7 son 7 más
		     angostas. Antes envolvía a varias filas y la última foto se estiraba
		     sola a todo el ancho (con 5 fotos, la quinta quedaba gigante y
		     recortada). Si son tantas que bajarían de 200 px, la fila se
		     desliza en horizontal, igual que en el móvil. -->
		<ul class="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto">
			{#each images as img, i (i)}
				<li
					class="w-[70vw] max-w-[320px] shrink-0 snap-center
						md:w-auto md:max-w-none md:min-w-[200px] md:flex-1 md:snap-start"
				>
					<a
						href={instagramUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="group relative block aspect-[4/5] overflow-hidden bg-graybrand md:aspect-auto md:h-[380px] lg:h-[420px]"
						aria-label="Ver {img.alt} en Instagram (se abre en una pestaña nueva)"
					>
						<img
							src={img.src ?? PLACEHOLDER}
							srcset={(img.src && srcsets[img.src]) || undefined}
							sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 70vw"
							alt=""
							loading="lazy"
							decoding="async"
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<span
							class="absolute inset-0 flex items-center justify-center bg-ink/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
						>
							<Instagram class="h-8 w-8 text-white" />
						</span>
					</a>
				</li>
			{/each}
		</ul>

		<!-- Sombra difusa decorativa bajo la franja. -->
		<div
			class="pointer-events-none absolute bottom-0 left-1/2 h-12 w-3/4 -translate-x-1/2 translate-y-1/2 rounded-full blur-2xl"
			style="background: radial-gradient(ellipse at center, rgba(38,38,53,0.18) 0%, transparent 70%);"
		></div>
	</div>
</section>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
