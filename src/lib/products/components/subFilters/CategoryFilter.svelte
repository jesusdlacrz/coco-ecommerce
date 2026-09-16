<script lang="ts">
	import type { CategoryStyle } from '$lib/products/filters/categoryStyles';

	interface Props {
		categories: string[];
		selected: string[];
		counts: Record<string, number>;
		toggleCategory: (c: string) => void;
		currentStyle: CategoryStyle;
	}

	let { categories, selected, counts, toggleCategory, currentStyle }: Props = $props();
</script>

<div class="flex flex-col gap-0.5 font-poppins">
	{#each categories as category (category)}
		{@const count = counts[category] ?? 0}
		{@const isActive = selected[0] === category}
		{@const isEmpty = count === 0}
		<button
			onclick={() => !isEmpty && toggleCategory(category)}
			disabled={isEmpty}
			aria-disabled={isEmpty}
			class="flex items-center justify-between rounded px-1 py-1.5 text-left text-sm transition-colors
				{isActive ? `${currentStyle.textAccent} font-semibold` : isEmpty ? 'cursor-not-allowed text-line' : `${currentStyle.textSecondary} hover:bg-gray-50`}"
		>
			<span>{category}</span>
			<span class="tabular-nums {isEmpty ? 'text-[#d0d0d0]' : 'opacity-60'}">({count})</span>
		</button>
	{/each}
</div>
