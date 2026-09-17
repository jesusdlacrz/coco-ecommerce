<script lang="ts">
	import ImageLightbox from './ImageLightbox.svelte';

	type Props = {
		images: string[];
		productName: string;
		selectedImageIndex: number;
		onImageSelect: (index: number) => void;
		accentColor?: string;
	};

	let {
		images,
		productName,
		selectedImageIndex,
		onImageSelect,
		accentColor = '#262635'
	}: Props = $props();

	let isLightboxOpen = $state(false);
</script>

<!-- Galería: thumbnails verticales izquierda + imagen principal derecha.
     `items-start` evita que el grid estire la imagen: así la relación 3/4 manda
     y todas las fichas de producto muestran la foto al mismo tamaño, sin
     importar cuánto texto tenga la columna de información al lado. -->
<div class="flex items-start gap-3">
	<!-- Columna de miniaturas (solo si hay más de 1 imagen) -->
	{#if images.length > 1}
		<div class="flex w-[72px] flex-shrink-0 flex-col gap-2">
			{#each images as image, index (`img-${index}`)}
				<button
					onclick={() => onImageSelect(index)}
					class="aspect-[3/4] w-full overflow-hidden rounded-lg border-2 bg-white transition-all
						{selectedImageIndex === index ? '' : 'border-line-soft hover:border-line'}"
					style={selectedImageIndex === index
						? `border-color: ${accentColor}; box-shadow: 0 0 0 2px ${accentColor}30;`
						: ''}
				>
					<img src={image} alt="Vista {index + 1}" class="h-full w-full object-cover" />
				</button>
			{/each}
		</div>
	{/if}

	<!-- Imagen principal: clic o tap la abre en zoom (funciona en celular con pellizco/doble tap) -->
	<button
		type="button"
		onclick={() => (isLightboxOpen = true)}
		aria-label="Ampliar imagen de {productName}"
		class="group relative aspect-[3/4] flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-white shadow-md"
	>
		<img
			src={images[selectedImageIndex] || '/placeholder.svg'}
			alt={productName}
			class="h-full w-full object-cover"
		/>
		<span
			class="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity group-hover:opacity-100"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<circle cx="11" cy="11" r="7" />
				<path stroke-linecap="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
			</svg>
		</span>
	</button>
</div>

{#if isLightboxOpen}
	<ImageLightbox
		{images}
		{productName}
		initialIndex={selectedImageIndex}
		onClose={() => (isLightboxOpen = false)}
	/>
{/if}
