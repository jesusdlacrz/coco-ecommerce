<script lang="ts">
	import type { CategoryStyle } from '$lib/products/filters/categoryStyles';
	import type { DynamicPricePreset } from '$lib/products/filters/dynamicPrice';

	interface Props {
		presets: readonly DynamicPricePreset[];
		counts: Record<string, number>;
		activePreset: string | null;
		selectPreset: (id: string) => void;
		currentStyle: CategoryStyle;
		touch?: boolean;
	}

	let { presets, counts, activePreset, selectPreset, currentStyle, touch = false }: Props =
		$props();

	// Fuera el deslizador de dos tiradores. Pedía puntería sobre una barra de
	// 3px en una pantalla táctil, sus tiradores se cortaban en los extremos,
	// arrastrar no contaba como filtro activo (ni aparecía etiqueta para
	// quitarlo) y convivía con esta misma lista repitiendo su función. Los
	// tramos son un solo mecanismo, dicen cuántas prendas hay en cada uno y no
	// se pueden errar con el dedo.
	const row = $derived(touch ? 'min-h-12 px-3' : 'min-h-10 px-2.5');
	const dot = $derived(touch ? 'h-5 w-5' : 'h-4 w-4');
</script>

<!-- Sin tramos no se monta ni el encabezado: de eso se encarga quien compone
     las secciones, igual que con Tallas y Colores. -->
<ul class="flex flex-col gap-0.5 font-poppins">
		{#each presets as preset (preset.id)}
			{@const count = counts[preset.id] ?? 0}
			{@const isActive = activePreset === preset.id}
			{@const isEmpty = count === 0 && !isActive}
			<li>
				<button
					onclick={() => selectPreset(preset.id)}
					disabled={isEmpty}
					aria-pressed={isActive}
					class="flex {row} w-full items-center gap-3 rounded-lg text-left text-sm transition-colors
						focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
						{isEmpty
						? 'cursor-not-allowed text-muted-faint'
						: isActive
							? `${currentStyle.textAccent} font-semibold`
							: `${currentStyle.textSecondary} hover:bg-graybrand/40`}"
				>
					<!-- Un punto, no una casilla: los tramos son excluyentes entre sí
					     (solo se puede tener uno activo), y la forma redonda es la que
					     comunica eso. -->
					<span
						class="{dot} flex flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors"
						style={isActive
							? `border-color:${currentStyle.accentColor}`
							: 'border-color:var(--color-line)'}
					>
						{#if isActive}
							<span
								class="h-1/2 w-1/2 rounded-full"
								style="background-color:{currentStyle.accentColor}"
							></span>
						{/if}
					</span>

					<span class="flex-1 truncate">{preset.label}</span>
					<span class="tabular-nums text-muted-faint">({count})</span>
				</button>
			</li>
		{/each}
	</ul>
