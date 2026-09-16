<script lang="ts">
	import type { CategoryStyle } from '$lib/products/filters/categoryStyles';

	type Chip = { label: string; remove: () => void };

	interface Props {
		chips: Chip[];
		currentStyle: CategoryStyle;
		clearAll?: () => void;
		/** En la hoja móvil los chips van bajo el título, sin su propio encabezado. */
		compact?: boolean;
	}

	let { chips, currentStyle, clearAll, compact = false }: Props = $props();
</script>

{#if chips.length > 0}
	<div
		class="font-poppins {compact ? '' : 'border-t border-line-soft pt-4'}"
	>
		{#if !compact}
			<div class="mb-2.5 flex items-center justify-between">
				<h4 class="font-display text-xs font-semibold tracking-[0.12em] text-muted uppercase">
					Filtros activos <span class="ml-1 {currentStyle.textAccent}">({chips.length})</span>
				</h4>
				{#if clearAll && chips.length > 1}
					<button
						onclick={clearAll}
						class="text-xs text-muted-faint underline-offset-2 transition-colors hover:text-ink hover:underline"
					>
						Limpiar todos
					</button>
				{/if}
			</div>
		{/if}

		<div class="flex flex-wrap gap-1.5">
			{#each chips as chip (chip.label)}
				<span
					class="inline-flex items-center gap-1 rounded-full py-1 pr-1.5 pl-3 text-xs font-medium {currentStyle.accent}"
				>
					{chip.label}
					<button
						aria-label="Quitar filtro {chip.label}"
						onclick={chip.remove}
						class="flex h-5 w-5 items-center justify-center rounded-full opacity-70 transition-opacity hover:bg-white/20 hover:opacity-100"
					>
						<svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
						</svg>
					</button>
				</span>
			{/each}
		</div>
	</div>
{/if}
