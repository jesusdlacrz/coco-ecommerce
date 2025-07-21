<script lang="ts">
	type Props = {
		images: string[];
		productName: string;
		selectedImageIndex: number;
		onImageSelect: (index: number) => void;
	};

	let { images, productName, selectedImageIndex, onImageSelect }: Props = $props();
</script>

<!-- Galería de imágenes -->
<div class="space-y-4">
	<!-- Imagen principal -->
	<div class="aspect-square bg-white rounded-lg shadow-lg overflow-hidden">
		<img
			src={images[selectedImageIndex] || '/placeholder.svg'}
			alt={productName}
			class="w-full h-full object-cover"
		/>
	</div>
	
	<!-- Miniaturas (si hay múltiples imágenes) -->
	{#if images.length > 1}
		<div class="grid grid-cols-4 gap-2">
			{#each images as image, index}
				<button
					onclick={() => onImageSelect(index)}
					class="aspect-square bg-white rounded border-2 overflow-hidden transition-all {selectedImageIndex === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}"
				>
					<img src={image} alt="Vista {index + 1}" class="w-full h-full object-cover" />
				</button>
			{/each}
		</div>
	{/if}
</div>
