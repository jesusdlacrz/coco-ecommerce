<script lang="ts">
	import { page } from '$app/state';
	import toast from 'svelte-5-french-toast';
	import type { PageData } from './$types';
	import Button from '$lib/shared/components/form/Button.svelte';

	let { data }: { data: PageData } = $props();

	const vendor = $derived(page.data.vendor);
	const storeUrl = $derived(vendor ? `${page.url.origin}/v/${vendor.slug}` : '');
	const whatsappShareHref = $derived(
		storeUrl ? `https://wa.me/?text=${encodeURIComponent(`Mira mi tienda: ${storeUrl}`)}` : ''
	);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(storeUrl);
			toast.success('Link copiado');
		} catch {
			toast.error('No se pudo copiar el link');
		}
	}
</script>

<svelte:head>
	<title>Panel - Coco's</title>
</svelte:head>

<h1 class="mb-6 font-display text-2xl font-bold text-ink">
	Hola, {vendor?.storeName}
</h1>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	<div class="rounded-2xl border border-line-soft bg-white p-5 shadow-sm sm:col-span-2">
		<h2 class="font-poppins text-sm font-medium text-muted-soft">Tu revista</h2>
		<div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
			<input
				readonly
				value={storeUrl}
				class="w-full flex-1 rounded-lg border border-line-soft bg-[#FAFAFA] px-3 py-2 font-mono text-sm text-ink"
			/>
			<div class="flex gap-2">
				<Button variant="secondary" size="sm" onclick={copyLink} class="whitespace-nowrap">
					Copiar
				</Button>
				<a
					href="/v/{vendor?.slug}"
					target="_blank"
					rel="noopener"
					class="inline-flex items-center justify-center rounded-xl border border-line px-4 py-2 font-display text-sm font-semibold whitespace-nowrap text-ink transition-colors hover:bg-graybrand/40"
				>
					Abrir ↗
				</a>
				<Button
					variant="whatsapp"
					size="sm"
					href={whatsappShareHref}
					target="_blank"
					rel="noopener"
					class="whitespace-nowrap"
				>
					Compartir
				</Button>
			</div>
		</div>
	</div>

	<div class="rounded-2xl border border-line-soft bg-white p-5 shadow-sm">
		<h2 class="font-poppins text-sm font-medium text-muted-soft">Comisión global</h2>
		<p class="mt-2 font-display text-4xl font-bold text-ink">
			{vendor?.commissionPercent}%
		</p>
		<p class="mt-1 font-body text-sm text-muted-faint">
			Se aplica a todas las prendas sin comisión propia
		</p>
		<a
			href="/panel/ajustes"
			class="mt-3 inline-block font-body text-sm font-semibold text-ink hover:underline"
		>
			Cambiar →
		</a>
	</div>

	<div class="rounded-2xl border border-line-soft bg-white p-5 shadow-sm">
		<h2 class="font-poppins text-sm font-medium text-muted-soft">
			Con comisión propia
		</h2>
		<p class="mt-2 font-display text-4xl font-bold text-ink">
			{data.customCommissionCount} / {data.totalProducts}
		</p>
		<a
			href="/panel/comisiones?filtro=propias"
			class="mt-3 inline-block font-body text-sm font-semibold text-ink hover:underline"
		>
			Ver →
		</a>
	</div>

	<div class="rounded-2xl border border-line-soft bg-white p-5 shadow-sm">
		<h2 class="font-poppins text-sm font-medium text-muted-soft">Prendas ocultas</h2>
		<p class="mt-2 font-display text-4xl font-bold text-ink">{data.hiddenCount}</p>
		<a
			href="/panel/comisiones?filtro=ocultas"
			class="mt-3 inline-block font-body text-sm font-semibold text-ink hover:underline"
		>
			Ver →
		</a>
	</div>
</div>
