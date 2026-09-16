<script lang="ts">
	import type { CategoryStyle } from '$lib/products/filters/categoryStyles';

	interface Props {
		colors: [string, string][];
		selectedColors: string[];
		toggleColor: (c: string) => void;
		currentStyle: CategoryStyle;
		containerClass?: string;
		touch?: boolean;
	}

	let {
		colors,
		selectedColors,
		toggleColor,
		currentStyle,
		containerClass = 'grid grid-cols-6 gap-1.5',
		touch = false
	}: Props = $props();

	// El área tocable es el botón, no el círculo: en móvil sube a 44px (mínimo
	// recomendado) aunque el punto de color siga viéndose del mismo tamaño.
	const cellClass = $derived(touch ? 'h-11 w-11' : 'h-9 w-9');
	const dotClass = $derived(touch ? 'h-7 w-7' : 'h-6 w-6');
</script>

<div class={containerClass}>
	{#each colors as [colorName, colorHex] (colorName)}
		{@const isSelected = selectedColors.includes(colorName)}
		<button
			onclick={() => toggleColor(colorName)}
			class="flex {cellClass} items-center justify-center rounded-full transition-colors hover:bg-graybrand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
			title={colorName}
			aria-pressed={isSelected}
			aria-label="Filtrar por color {colorName}"
		>
			<span
				class="{dotClass} rounded-full border transition-all
					{isSelected
					? `border-transparent ring-2 ring-offset-2 ${currentStyle.ringColor}`
					: 'border-line'}"
				style="background-color:{colorHex}"
			></span>
		</button>
	{/each}
</div>
