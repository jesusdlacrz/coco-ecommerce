<script lang="ts">
	import type { CategoryStyle } from '$lib/products/filters/categoryStyles';

	interface Props {
		colors: [string, string][];
		selectedColors: string[];
		toggleColor: (c: string) => void;
		currentStyle: CategoryStyle;
		containerClass?: string;
	}

	let {
		colors,
		selectedColors,
		toggleColor,
		currentStyle,
		containerClass = 'grid grid-cols-8 gap-1'
	}: Props = $props();
</script>

<div class={containerClass}>
	{#each colors as [colorName, colorHex] (colorName)}
		<button
			onclick={() => toggleColor(colorName)}
			class="flex items-center justify-center rounded-lg transition-all hover:bg-gray-50
				{selectedColors.includes(colorName) ? 'bg-gray-100' : ''}"
			title={colorName}
			aria-label="Filtrar por color {colorName}{selectedColors.includes(colorName) ? ' (seleccionado)' : ''}"
		>
			<div
				class="h-6 w-6 rounded-full border-2 transition-all
					{selectedColors.includes(colorName)
						? `border-transparent ring-2 ring-offset-2 ${currentStyle.ringColor}`
						: colorName === 'Blanco'
							? 'border-gray-300'
							: 'border-gray-200'}"
				style="background-color:{colorHex}"
			></div>
		</button>
	{/each}
</div>
