<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import toast from 'svelte-5-french-toast';
	import { priceWithCommission } from '$lib/pricing/commission';
	import { formatPrice } from '$lib/shared/utils/price';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	interface RowChange {
		commissionPercent: string;
		hidden: boolean;
	}

	const changes = new SvelteMap<string, RowChange>();
	let search = $state('');
	let filter = $state(page.url.searchParams.get('filtro') ?? 'todas');
	let bulkPercent = $state('');
	let saving = $state(false);

	function baseChange(row: (typeof data.rows)[number]): RowChange {
		return {
			commissionPercent: row.commissionPercent === null ? '' : String(row.commissionPercent),
			hidden: row.hidden
		};
	}

	function currentValue(row: (typeof data.rows)[number]): RowChange {
		return changes.get(row.id) ?? baseChange(row);
	}

	function setPercent(row: (typeof data.rows)[number], value: string) {
		changes.set(row.id, { ...currentValue(row), commissionPercent: value });
	}

	function toggleHidden(row: (typeof data.rows)[number]) {
		const cur = currentValue(row);
		changes.set(row.id, { ...cur, hidden: !cur.hidden });
	}

	function resetToGlobal(row: (typeof data.rows)[number]) {
		changes.set(row.id, { ...currentValue(row), commissionPercent: '' });
	}

	function discardChanges() {
		changes.clear();
	}

	function livePrice(row: (typeof data.rows)[number]): number {
		const cur = currentValue(row);
		const pct =
			cur.commissionPercent.trim() === '' ? data.globalCommission : Number(cur.commissionPercent);
		if (!Number.isFinite(pct)) return row.basePrice;
		return priceWithCommission(row.basePrice, pct);
	}

	const visibleRows = $derived(
		data.rows.filter((row) => {
			const query = search.trim().toLowerCase();
			if (query && !`${row.name} ${row.sku}`.toLowerCase().includes(query)) return false;

			const cur = currentValue(row);
			const usesGlobal = cur.commissionPercent.trim() === '';
			if (filter === 'propias') return !usesGlobal;
			if (filter === 'globales') return usesGlobal;
			if (filter === 'ocultas') return cur.hidden;
			return true;
		})
	);

	function applyBulk() {
		const pct = Number(bulkPercent);
		if (!Number.isFinite(pct) || pct < 0 || pct > 300) {
			toast.error('Ingresa un % válido (0 a 300)');
			return;
		}
		for (const row of visibleRows) {
			setPercent(row, String(pct));
		}
		bulkPercent = '';
	}

	const changesPayload = $derived(
		JSON.stringify(
			[...changes.entries()].map(([productId, c]) => ({
				productId,
				commissionPercent: c.commissionPercent,
				hidden: c.hidden
			}))
		)
	);

	beforeNavigate(({ cancel }) => {
		if (changes.size > 0 && !confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')) {
			cancel();
		}
	});
</script>

<svelte:head>
	<title>Comisiones - Coco's</title>
</svelte:head>

<h1 class="mb-6 font-['Volkhov',serif] text-2xl font-bold text-[#262635]">Comisiones por prenda</h1>

<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	<div class="flex flex-1 flex-wrap gap-2">
		<input
			type="search"
			placeholder="Buscar por nombre o SKU..."
			bind:value={search}
			class="w-full max-w-xs rounded-lg border border-black/15 px-3 py-2 text-sm focus:border-[#FCA120] focus:outline-none"
		/>
		<select bind:value={filter} class="rounded-lg border border-black/15 px-3 py-2 text-sm">
			<option value="todas">Todas</option>
			<option value="propias">Con comisión propia</option>
			<option value="globales">Usan la global</option>
			<option value="ocultas">Ocultas</option>
		</select>
	</div>

	<div class="flex items-center gap-2">
		<input
			type="number"
			placeholder="%"
			bind:value={bulkPercent}
			class="w-20 rounded-lg border border-black/15 px-2 py-2 text-sm"
		/>
		<button
			onclick={applyBulk}
			class="rounded-lg border border-black/15 px-3 py-2 text-sm font-medium whitespace-nowrap text-[#262635] hover:bg-gray-50"
		>
			Aplicar a {visibleRows.length} visibles
		</button>
	</div>
</div>

<div class="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
	<table class="w-full text-left text-sm">
		<thead class="border-b border-black/10 text-xs text-[#a0a0a0] uppercase">
			<tr>
				<th class="px-4 py-3">Producto</th>
				<th class="px-4 py-3">Precio base</th>
				<th class="px-4 py-3">Comisión %</th>
				<th class="px-4 py-3">Precio final</th>
				<th class="px-4 py-3">Visible</th>
			</tr>
		</thead>
		<tbody>
			{#each visibleRows as row (row.id)}
				{@const cur = currentValue(row)}
				{@const usesGlobal = cur.commissionPercent.trim() === ''}
				{@const edited = changes.has(row.id)}
				<tr
					class="border-b border-black/5 last:border-0 {edited ? 'bg-amber-50' : ''} {usesGlobal
						? ''
						: 'border-l-2 border-l-[#FCA120]'}"
				>
					<td class="px-4 py-3">
						<div class="flex items-center gap-3">
							<img src={row.image} alt={row.name} class="h-10 w-10 rounded-md object-cover" />
							<div>
								<p class="font-medium text-[#262635]">{row.name}</p>
								<p class="text-xs text-[#a0a0a0]">{row.sku}</p>
							</div>
						</div>
					</td>
					<td class="px-4 py-3 text-[#767676]">{formatPrice(row.basePrice)}</td>
					<td class="px-4 py-3">
						<div class="flex items-center gap-2">
							<input
								type="number"
								placeholder={String(data.globalCommission)}
								value={cur.commissionPercent}
								oninput={(e) => setPercent(row, e.currentTarget.value)}
								class="w-20 rounded-lg border px-2 py-1.5 text-sm {usesGlobal
									? 'border-black/15 text-[#a0a0a0]'
									: 'border-[#FCA120]'}"
							/>
							{#if usesGlobal}
								<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
									>Global</span
								>
							{:else}
								<span class="rounded-full bg-[#FCA120]/20 px-2 py-0.5 text-xs text-[#262635]"
									>Propia</span
								>
								<button
									onclick={() => resetToGlobal(row)}
									aria-label="Volver a la comisión global"
									class="text-[#a0a0a0] hover:text-[#262635]"
								>
									×
								</button>
							{/if}
						</div>
					</td>
					<td class="px-4 py-3 font-medium text-[#262635]">{formatPrice(livePrice(row))}</td>
					<td class="px-4 py-3">
						<button
							onclick={() => toggleHidden(row)}
							aria-pressed={cur.hidden}
							class="rounded-full border px-3 py-1 text-xs font-medium {cur.hidden
								? 'border-black/10 bg-gray-100 text-gray-500'
								: 'border-green-200 bg-green-50 text-green-700'}"
						>
							{cur.hidden ? 'Oculta' : 'Visible'}
						</button>
					</td>
				</tr>
			{/each}
			{#if visibleRows.length === 0}
				<tr>
					<td colspan="5" class="px-4 py-8 text-center text-[#a0a0a0]"
						>No hay productos que coincidan</td
					>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

{#if changes.size > 0}
	<form
		method="POST"
		action="?/guardar"
		class="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 px-4 py-3 backdrop-blur"
		use:enhance={() => {
			saving = true;
			return async ({ result, update }) => {
				saving = false;
				if (result.type === 'success') {
					changes.clear();
					toast.success('Precios actualizados');
				}
				await update({ reset: false });
			};
		}}
	>
		<input type="hidden" name="cambios" value={changesPayload} />
		<div class="mx-auto flex max-w-6xl items-center justify-between">
			<p class="font-['Jost',sans-serif] text-sm text-[#262635]">
				{changes.size}
				{changes.size === 1 ? 'cambio' : 'cambios'} sin guardar
			</p>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={discardChanges}
					class="rounded-lg px-4 py-2 text-sm font-medium text-[#767676] hover:bg-gray-100"
				>
					Descartar
				</button>
				<button
					type="submit"
					disabled={saving}
					class="rounded-lg bg-[#FCA120] px-5 py-2 text-sm font-semibold text-[#262635] hover:bg-[#e8931a] disabled:opacity-50"
				>
					{saving ? 'Guardando...' : 'Guardar cambios'}
				</button>
			</div>
		</div>
	</form>
{/if}

{#if form?.mensaje}
	<p
		class="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 shadow"
	>
		{form.mensaje}
	</p>
{/if}
