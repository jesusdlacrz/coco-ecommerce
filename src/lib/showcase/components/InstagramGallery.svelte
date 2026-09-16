<script lang="ts">
	import type { SiteInstagramImage } from '$lib/shared/services/siteContent.server';

	const INSTAGRAM_URL = 'https://www.instagram.com/cocos.bodegaderopa?igsi=d3p0aHVmMHhzb3h5';
	const PLACEHOLDER = '/placeholder.svg?height=400&width=400';

	// Marcadores de posición mientras no haya imágenes cargadas en WordPress.
	const FALLBACK_IMAGES: SiteInstagramImage[] = Array.from({ length: 7 }, (_, i) => ({
		src: null,
		alt: `foto ${i + 1}`
	}));

	let { images: provided = [] }: { images?: SiteInstagramImage[] } = $props();

	const images = $derived(provided.length ? provided : FALLBACK_IMAGES);
</script>

{#snippet galleryTile(img: SiteInstagramImage)}
	<a
		href={INSTAGRAM_URL}
		target="_blank"
		rel="noopener noreferrer"
		class="group relative block aspect-square overflow-hidden"
		aria-label="Ver en Instagram (se abre en una pestaña nueva)"
	>
		<img
			src={img.src ?? PLACEHOLDER}
			alt={img.alt}
			class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
		/>
		<div
			class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		>
			<svg class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
				<path
					d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
				/>
			</svg>
		</div>
	</a>
{/snippet}

<section class="py-20">
	<!-- Title -->
	<div class="mb-12 text-center">
		<a
			href={INSTAGRAM_URL}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-block transition-opacity hover:opacity-70"
			aria-label="Ver Coco's en Instagram (se abre en una pestaña nueva)"
		>
			<!-- Ícono centrado arriba: si el título pasa a dos líneas en móvil, el
				 ícono no queda descentrado respecto a una de las líneas. -->
			<div class="mb-3 flex justify-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="h-8 w-8 text-[#e8a838]"
				>
					<path
						d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
					/>
				</svg>
			</div>
			<h2 class="font-display text-3xl text-ink sm:text-4xl">Síguenos en Instagram</h2>
		</a>
		<p class="mt-3 text-sm leading-relaxed text-muted-soft">
			Mira las últimas prendas, looks y novedades directamente en nuestra cuenta.
		</p>
	</div>

	<!-- Gallery strip wrapper (relative for shadow div) -->
	<div class="relative">
		<!-- Mobile: horizontal scroll -->
		<div class="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide md:hidden">
			{#each images as img, i (i)}
				<div class="w-[45vw] flex-shrink-0 snap-center">
					{@render galleryTile(img)}
				</div>
			{/each}
		</div>

		<!-- Tablet: 4 columns grid -->
		<div class="hidden grid-cols-4 md:grid lg:hidden">
			{#each images as img, i (i)}
				{@render galleryTile(img)}
			{/each}
		</div>

		<!-- Desktop: 7 columns strip -->
		<div class="hidden grid-cols-7 lg:grid">
			{#each images as img, i (i)}
				{@render galleryTile(img)}
			{/each}
		</div>

		<!-- Decorative shadow below the strip -->
		<div
			class="pointer-events-none absolute bottom-0 left-1/2 h-12 w-3/4 -translate-x-1/2 translate-y-1/2 rounded-full blur-2xl"
			style="background: radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, transparent 70%);"
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
