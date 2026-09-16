<script lang="ts">
	import type { CategoryStyle } from '$lib/products/filters/categoryStyles';

	type Chip = { label: string; remove: () => void };

	interface Props {
		chips: Chip[];
		currentStyle: CategoryStyle;
		clearAll?: () => void;
	}

	let { chips, currentStyle, clearAll }: Props = $props();
</script>

{#if chips.length > 0}
	<div class="border-t pt-4 font-poppins" style="border-color:{currentStyle.accentColor}20">
		<!-- Header: title + clear all -->
		<div class="mb-2.5 flex items-center justify-between">
			<h4 class="text-xs font-semibold uppercase tracking-wide text-muted">
				Filtros activos <span class="ml-1 {currentStyle.textAccent}">({chips.length})</span>
			</h4>
			{#if clearAll && chips.length > 1}
				<button
					onclick={clearAll}
					class="text-xs text-muted-faint underline-offset-2 transition-colors hover:text-muted hover:underline"
				>
					Limpiar todos
				</button>
			{/if}
		</div>

		<!-- Chips -->
		<div class="flex flex-wrap gap-1.5">
			{#each chips as chip (chip.label)}
				<span
					class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium {currentStyle.accent}"
				>
					{chip.label}
					<button
						aria-label="Quitar {chip.label}"
						onclick={chip.remove}
						class="flex h-3.5 w-3.5 items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100"
					>
						×
					</button>
				</span>
			{/each}
		</div>
	</div>
{/if}
