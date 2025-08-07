<script lang="ts">
	type Props = {
		images: string[];
		productName: string;
		selectedImageIndex: number;
		onImageSelect: (index: number) => void;
		id: string; // Assuming product.id is passed for view transition purposes
	};

	let { images, productName, selectedImageIndex, onImageSelect, id }: Props = $props();
</script>

<!-- Galería de imágenes -->
<div class="space-y-4">
	<!-- Imagen principal -->
	<div class="aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
		<img
			src={images[selectedImageIndex] || '/placeholder.svg'}
			alt={productName}
			class="h-full w-full object-cover"
			style="view-transition-name: image-{id};"
		/>
	</div>

	<!-- Miniaturas (si hay múltiples imágenes) -->
	{#if images.length > 1}
		<div class="grid grid-cols-4 gap-2">
			{#each images as image, index (`img-${index}`)}
				<button
					onclick={() => onImageSelect(index)}
					class="aspect-square overflow-hidden rounded border-2 bg-white transition-all {selectedImageIndex ===
					index
						? 'border-blue-500 ring-2 ring-blue-200'
						: 'border-gray-200 hover:border-gray-300'}"
				>
					<img src={image} alt="Vista {index + 1}" class="h-full w-full object-cover" />
				</button>
			{/each}
		</div>
	{/if}
</div>
