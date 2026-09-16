<script lang="ts">
	import { page } from '$app/state';
	import toast from 'svelte-5-french-toast';
	import type { PageData } from './$types';

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
	<div class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:col-span-2">
		<h2 class="font-poppins text-sm font-medium text-muted-soft">Tu revista</h2>
		<div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
			<input
				readonly
				value={storeUrl}
				class="w-full flex-1 rounded-lg border border-black/10 bg-[#FAFAFA] px-3 py-2 font-mono text-sm text-ink"
			/>
			<div class="flex gap-2">
				<button
					onclick={copyLink}
					class="rounded-lg bg-ink px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-black"
				>
					Copiar
				</button>
				<a
					href="/v/{vendor?.slug}"
					target="_blank"
					rel="noopener"
					class="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium whitespace-nowrap text-ink hover:bg-gray-50"
				>
					Abrir ↗
				</a>
				<a
					href={whatsappShareHref}
					target="_blank"
					rel="noopener"
					class="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:opacity-90"
				>
					Compartir
				</a>
			</div>
		</div>
	</div>

	<div class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
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

	<div class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
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

	<div class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
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
