<script lang="ts">
	type Props = {
		images: string[];
		productName: string;
		selectedImageIndex: number;
		onImageSelect: (index: number) => void;
		id: string;
		accentColor?: string;
	};

	let { images, productName, selectedImageIndex, onImageSelect, id, accentColor = '#262635' }: Props = $props();
</script>

<!-- Galería: thumbnails verticales izquierda + imagen principal derecha -->
<div class="flex gap-3">
	<!-- Columna de miniaturas (solo si hay más de 1 imagen) -->
	{#if images.length > 1}
		<div class="flex w-[72px] flex-shrink-0 flex-col gap-2">
			{#each images as image, index (`img-${index}`)}
				<button
					onclick={() => onImageSelect(index)}
					class="aspect-square w-full overflow-hidden rounded-md border-2 bg-white transition-all
						{selectedImageIndex === index ? '' : 'border-gray-200 hover:border-gray-300'}"
					style={selectedImageIndex === index
						? `border-color: ${accentColor}; box-shadow: 0 0 0 2px ${accentColor}30;`
						: ''}
				>
					<img src={image} alt="Vista {index + 1}" class="h-full w-full object-cover" />
				</button>
			{/each}
		</div>
	{/if}

	<!-- Imagen principal -->
	<div class="min-h-[340px] flex-1 overflow-hidden rounded-lg bg-white shadow-md sm:min-h-[420px]">
		<img
			src={images[selectedImageIndex] || '/placeholder.svg'}
			alt={productName}
			class="h-full w-full object-cover"
			style="view-transition-name: image-{id};"
		/>
	</div>
</div>
