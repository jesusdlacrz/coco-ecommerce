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
		onRangeChange
	}: Props = $props();

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

	// Click on track: jump nearest thumb
	function onTrackClick(e: MouseEvent) {
		const val = getValueFromX(e.clientX);
		if (Math.abs(val - localMin) <= Math.abs(val - localMax)) {
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
				class="absolute top-1/2 right-0 left-0 h-[3px] -translate-y-1/2 cursor-pointer rounded-full bg-gray-200"
				onclick={onTrackClick}
			>
				<!-- Colored fill between thumbs -->
				<div
					class="absolute top-0 h-full rounded-full"
					style="left:{leftPct}%; right:{100 -
						rightPct}%; background-color:{currentStyle.accentColor}"
				></div>
			</div>

			<!-- Min thumb -->
			<div
				role="slider"
				tabindex="0"
				aria-label="Precio mínimo"
				aria-valuemin={minBound}
				aria-valuemax={maxBound}
				aria-valuenow={localMin}
				class="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-white
					shadow-[0_1px_3px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.06)]
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

			<!-- Max thumb -->
			<div
				role="slider"
				tabindex="0"
				aria-label="Precio máximo"
				aria-valuemin={minBound}
				aria-valuemax={maxBound}
				aria-valuenow={localMax}
				class="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-white
					shadow-[0_1px_3px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.06)]
					transition-transform outline-none hover:scale-110
					focus-visible:ring-2 focus-visible:ring-offset-1
					active:scale-110 active:cursor-grabbing"
				style="left:{rightPct}%; border:2px solid {currentStyle.accentColor}; z-index:{activeThumb ===
				'max'
					? 20
					: 10}"
				onpointerdown={onMaxDown}
				onpointermove={onMaxMove}
				onpointerup={onUp}
				onlostpointercapture={onUp}
				onkeydown={onMaxKey}
			></div>
		</div>

		<!-- Price labels below slider -->
		<div class="mt-2 flex justify-between text-xs font-medium text-muted">
			<span>{formatPriceCOP(localMin)}</span>
			<span>{formatPriceCOP(localMax)}</span>
		</div>

		<!-- Preset quick-picks -->
		{#if presets.length > 0}
			<div class="mt-4 flex flex-col gap-1 border-t border-gray-100 pt-3">
				{#each presets as preset (preset.id)}
					<button
						onclick={() => selectPreset(preset.id)}
						aria-pressed={activePreset === preset.id}
						class="w-full rounded py-1 text-left text-sm transition-colors
							{activePreset === preset.id
							? `${currentStyle.textAccent} font-semibold`
							: currentStyle.textSecondary}"
					>
						{preset.label}
						<span class="ml-1 opacity-60">({counts[preset.id] ?? 0})</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}
