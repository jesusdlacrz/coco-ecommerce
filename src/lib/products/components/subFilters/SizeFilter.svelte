<script lang="ts">
	import type { CategoryStyle } from '$lib/products/filters/categoryStyles';
	import { formatSize, sortSizes } from '$lib/shared/model/sizes';

	interface Props {
		sizes: string[];
		selectedSizes: string[];
		toggleSize: (s: string) => void;
		currentStyle: CategoryStyle;
		touch?: boolean;
	}

	let { sizes, selectedSizes, toggleSize, currentStyle, touch = false }: Props = $props();

	const cellClass = $derived(touch ? 'h-11' : 'h-9');

	const sortedSizes = $derived(sortSizes(sizes));
</script>

<div class="grid grid-cols-4 gap-2 font-poppins">
	{#each sortedSizes as size (size)}
		{@const isSelected = selectedSizes.includes(size)}
		<button
			onclick={() => toggleSize(size)}
			aria-pressed={isSelected}
			class="flex {cellClass} items-center justify-center rounded-lg border text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
				{isSelected
				? currentStyle.accent
				: `border-line text-muted-soft ${currentStyle.hoverBorderColor} hover:text-ink`}"
		>
			{formatSize(size)}
		</button>
	{/each}
</div>
