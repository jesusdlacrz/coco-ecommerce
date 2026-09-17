<script lang="ts">
	import type { CategoryStyle } from '$lib/products/filters/categoryStyles';
	import type { DynamicPricePreset } from '$lib/products/filters/dynamicPrice';
	import type { PriceRange } from '$lib/products/filters/filterUtils';
	import { formatPrice as formatPriceCOP } from '$lib/shared/utils/price';

	interface Props {
		presets: readonly DynamicPricePreset[];
		counts: Record<string, number>;
		activePreset: string | null;
		selectPreset: (id: string) => void;
		currentStyle: CategoryStyle;
		minBound: number;
		maxBound: number;
		priceRange: PriceRange;
		onRangeChange: (range: PriceRange) => void;
		touch?: boolean;
	}

	let {
		presets,
		counts,
		activePreset,
		selectPreset,
		currentStyle,
		minBound,
		maxBound,
		priceRange,
		onRangeChange,
		touch = false
	}: Props = $props();

	// Arrastrar un punto de 18px con el dedo es incómodo; en móvil crece a 26px.
	const thumbSize = $derived(touch ? 'h-[26px] w-[26px]' : 'h-[18px] w-[18px]');
	const presetRow = $derived(touch ? 'min-h-11 px-3' : 'min-h-9 px-2');

	let localMin = $state(priceRange.min);
	let localMax = $state(priceRange.max);
	let trackEl = $state<HTMLDivElement | null>(null);
	let activeThumb: 'min' | 'max' | null = $state(null);

	// Sync when parent resets (clearAllFilters, preset click, etc.)
	$effect(() => {
		localMin = priceRange.min;
		localMax = priceRange.max;
	});

	const totalRange = $derived(maxBound - minBound || 1);
	const leftPct = $derived(((localMin - minBound) / totalRange) * 100);
	const rightPct = $derived(((localMax - minBound) / totalRange) * 100);
	const singlePrice = $derived(minBound === maxBound);

	// Un preset como "Hasta $44.500" puede dejar min y max en el MISMO valor.
	// Dibujar dos tiradores encima uno del otro se leía como un defecto, así que
	// el rango colapsado muestra uno solo. Para volver a abrirlo está el clic en
	// la barra, que siempre mueve el extremo del lado al que se hizo clic.
	const collapsed = $derived(localMin === localMax);

	function snap(raw: number): number {
		return Math.round(raw / 1000) * 1000;
	}

	function getValueFromX(clientX: number): number {
		if (!trackEl) return minBound;
		const rect = trackEl.getBoundingClientRect();
		const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		return snap(minBound + pct * totalRange);
	}

	// Min thumb handlers
	function onMinDown(e: PointerEvent) {
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		activeThumb = 'min';
	}
	function onMinMove(e: PointerEvent) {
		if (activeThumb !== 'min') return;
		const clamped = Math.max(minBound, Math.min(getValueFromX(e.clientX), localMax - 1000));
		localMin = clamped;
		onRangeChange({ min: clamped, max: localMax });
	}

	// Max thumb handlers
	function onMaxDown(e: PointerEvent) {
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		activeThumb = 'max';
	}
	function onMaxMove(e: PointerEvent) {
		if (activeThumb !== 'max') return;
		const clamped = Math.min(maxBound, Math.max(getValueFromX(e.clientX), localMin + 1000));
		localMax = clamped;
		onRangeChange({ min: localMin, max: clamped });
	}

	function onUp() {
		activeThumb = null;
	}

	// Clic en la barra: mueve el extremo correspondiente. Antes desempataba por
	// cercanía, y con min === max los dos estaban a la misma distancia: ganaba
	// siempre el mínimo, que ya no podía subir más, así que el rango colapsado
	// no había forma de volver a ensancharlo. Ahora, un clic fuera del rango
	// mueve el extremo de ese lado.
	function onTrackClick(e: MouseEvent) {
		const val = getValueFromX(e.clientX);
		const moveMin = val < localMin || (val < localMax && Math.abs(val - localMin) < Math.abs(val - localMax));
		if (moveMin) {
			const clamped = Math.max(minBound, Math.min(val, localMax - 1000));
			localMin = clamped;
			onRangeChange({ min: clamped, max: localMax });
		} else {
			const clamped = Math.min(maxBound, Math.max(val, localMin + 1000));
			localMax = clamped;
			onRangeChange({ min: localMin, max: clamped });
		}
	}

	// Keyboard for thumbs
	function onMinKey(e: KeyboardEvent) {
		const step = e.shiftKey ? 10000 : 1000;
		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			e.preventDefault();
			const v = Math.max(minBound, localMin - step);
			localMin = v;
			onRangeChange({ min: v, max: localMax });
		} else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			e.preventDefault();
			const v = Math.min(localMax - 1000, localMin + step);
			localMin = v;
			onRangeChange({ min: v, max: localMax });
		}
	}
	function onMaxKey(e: KeyboardEvent) {
		const step = e.shiftKey ? 10000 : 1000;
		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			e.preventDefault();
			const v = Math.max(localMin + 1000, localMax - step);
			localMax = v;
			onRangeChange({ min: localMin, max: v });
		} else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			e.preventDefault();
			const v = Math.min(maxBound, localMax + step);
			localMax = v;
			onRangeChange({ min: localMin, max: v });
		}
	}
</script>

{#if singlePrice}
	<p class="font-poppins text-sm {currentStyle.textSecondary}">
		{formatPriceCOP(minBound)}
	</p>
{:else}
	<div class="font-poppins">
		<!-- Custom dual-range slider — no native inputs -->
		<div class="relative mt-4 mb-1 h-5 select-none" bind:this={trackEl}>
			<!-- Track: clickable background -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="absolute top-1/2 right-0 left-0 h-[3px] -translate-y-1/2 cursor-pointer rounded-full bg-line"
				onclick={onTrackClick}
			>
				<!-- Colored fill between thumbs -->
				<div
					class="absolute top-0 h-full rounded-full"
					style="left:{leftPct}%; right:{100 - rightPct}%; min-width:2px; background-color:{currentStyle.accentColor}"
				></div>
			</div>

			<!-- Min thumb — oculto cuando el rango colapsa a un solo valor: dos
			     tiradores dibujados uno encima del otro se leían como un defecto. -->
			{#if !collapsed}
				<div
					role="slider"
					tabindex="0"
					aria-label="Precio mínimo"
					aria-valuemin={minBound}
					aria-valuemax={maxBound}
					aria-valuenow={localMin}
					class="absolute top-1/2 {thumbSize} -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-white
						shadow-control
						transition-transform outline-none hover:scale-110
						focus-visible:ring-2 focus-visible:ring-offset-1
						active:scale-110 active:cursor-grabbing"
					style="left:{leftPct}%; border:2px solid {currentStyle.accentColor}; z-index:{activeThumb ===
					'min'
						? 20
						: 10}"
					onpointerdown={onMinDown}
					onpointermove={onMinMove}
					onpointerup={onUp}
					onlostpointercapture={onUp}
					onkeydown={onMinKey}
				></div>
			{/if}

			<!-- Max thumb -->
			<div
				role="slider"
				tabindex="0"
				aria-label="Precio máximo"
				aria-valuemin={minBound}
				aria-valuemax={maxBound}
				aria-valuenow={localMax}
				class="absolute top-1/2 {thumbSize} -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-white
					shadow-control
					transition-transform outline-none hover:scale-110
					focus-visible:ring-2 focus-visible:ring-offset-1
					active:scale-110 active:cursor-grabbing"
				style="left:{rightPct}%; border:2px solid {currentStyle.accentColor}; z-index:{activeThumb ===
				'max'
					? 20
					: 11}"
				onpointerdown={onMaxDown}
				onpointermove={onMaxMove}
				onpointerup={onUp}
				onlostpointercapture={onUp}
				onkeydown={onMaxKey}
			></div>
		</div>

		<!-- Con el rango colapsado, repetir el mismo precio a izquierda y derecha
		     se leía como si fueran dos valores distintos. -->
		<div class="mt-2 text-xs font-medium text-muted">
			{#if localMin === localMax}
				<p class="text-center">{formatPriceCOP(localMin)}</p>
			{:else}
				<div class="flex justify-between">
					<span>{formatPriceCOP(localMin)}</span>
					<span>{formatPriceCOP(localMax)}</span>
				</div>
			{/if}
		</div>

		<!-- Preset quick-picks -->
		{#if presets.length > 0}
			<div class="mt-4 flex flex-col gap-0.5 border-t border-line-soft pt-3">
				{#each presets as preset (preset.id)}
					{@const isActive = activePreset === preset.id}
					<button
						onclick={() => selectPreset(preset.id)}
						aria-pressed={isActive}
						class="flex {presetRow} w-full items-center justify-between rounded-lg text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
							{isActive
							? `${currentStyle.textAccent} font-semibold`
							: `${currentStyle.textSecondary} hover:bg-graybrand/40`}"
					>
						<span>{preset.label}</span>
						<span class="tabular-nums text-muted-faint">({counts[preset.id] ?? 0})</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}
