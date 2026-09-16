<script lang="ts">
	import type { CategoryStyle } from '$lib/products/filters/categoryStyles';

	interface Props {
		sizes: string[];
		selectedSizes: string[];
		toggleSize: (s: string) => void;
		currentStyle: CategoryStyle;
	}

	let { sizes, selectedSizes, toggleSize, currentStyle }: Props = $props();

	// Standard letter sizes in correct S→XL order
	const LETTER_ORDER: Record<string, number> = {
		XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6, XXXL: 7,
		'S/M': 8, 'L/XL': 9, ÚNICO: 99, UNICO: 99
	};

	const sortedSizes = $derived(
		[...sizes].sort((a, b) => {
			const aNum = parseFloat(a);
			const bNum = parseFloat(b);
			const aIsNum = !isNaN(aNum) && String(aNum) === a.trim();
			const bIsNum = !isNaN(bNum) && String(bNum) === b.trim();

			if (aIsNum && bIsNum) return aNum - bNum; // numeric: 4 < 6 < 8 < 10
			if (!aIsNum && !bIsNum) return (LETTER_ORDER[a.toUpperCase()] ?? 50) - (LETTER_ORDER[b.toUpperCase()] ?? 50); // letter: XS < S < M...
			return aIsNum ? 1 : -1; // letters before numbers
		})
	);
</script>

<div class="grid grid-cols-4 gap-2 font-poppins">
	{#each sortedSizes as size (size)}
		<button
			onclick={() => toggleSize(size)}
			class="rounded-md border px-2 py-2 text-sm transition-all
				{selectedSizes.includes(size)
					? currentStyle.accent
					: `${currentStyle.borderColor} text-muted-soft ${currentStyle.accentHover} ${currentStyle.hoverBorderColor}`}"
		>
			{size}
		</button>
	{/each}
</div>
