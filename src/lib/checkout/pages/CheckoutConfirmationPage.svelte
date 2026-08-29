<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { cartStore } from '$lib/cart/stores/cartStore';
	import { HOUSE_STORE } from '$lib/storefront/model';

	const POLL_INTERVAL_MS = 2000;
	const POLL_TIMEOUT_MS = 40_000;

	type CheckoutStatus = 'pending' | 'approved' | 'declined' | 'timeout' | 'not_found';

	const store = $derived(page.data.storefront ?? HOUSE_STORE);
	const reference = $derived(page.url.searchParams.get('reference'));

	let status = $state<CheckoutStatus>('pending');
	let wooOrderId = $state<number | null>(null);
	let pollHandle: ReturnType<typeof setInterval> | undefined;
	let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

	async function checkStatus(ref: string) {
		try {
			const res = await fetch(`/api/checkout/status?reference=${encodeURIComponent(ref)}`);
			if (res.status === 404) {
				status = 'not_found';
				stopPolling();
				return;
			}
			if (!res.ok) return;
			const data = (await res.json()) as {
				status: 'pending' | 'approved' | 'declined';
				wooOrderId: number | null;
			};
			if (data.status === 'approved') {
				status = 'approved';
				wooOrderId = data.wooOrderId;
				cartStore.clearCart();
				stopPolling();
			} else if (data.status === 'declined') {
				status = 'declined';
				stopPolling();
			}
		} catch {
			// Se reintenta en el siguiente tick del polling.
		}
	}

	function stopPolling() {
		if (pollHandle) clearInterval(pollHandle);
		if (timeoutHandle) clearTimeout(timeoutHandle);
	}

	onMount(() => {
		if (!reference) {
			status = 'not_found';
			return;
		}
		checkStatus(reference);
		pollHandle = setInterval(() => checkStatus(reference), POLL_INTERVAL_MS);
		timeoutHandle = setTimeout(() => {
			if (status === 'pending') status = 'timeout';
			stopPolling();
		}, POLL_TIMEOUT_MS);
	});

	onDestroy(stopPolling);
</script>

<svelte:head>
	<title>Confirmación de pago - {store.name}</title>
</svelte:head>

<div class="flex min-h-[70vh] items-center justify-center px-4">
	<div class="max-w-md text-center">
		{#if status === 'pending'}
			<div
				class="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-[#d1d1d1] border-t-[#262635]"
			></div>
			<h1 class="font-['Volkhov',serif] text-2xl font-bold text-[#262635]">
				Confirmando tu pago...
			</h1>
			<p class="mt-2 text-sm text-[#6a6a6a]">No cierres esta ventana.</p>
		{:else if status === 'approved'}
			<h1 class="font-['Volkhov',serif] text-2xl font-bold text-[#262635]">¡Pago aprobado!</h1>
			<p class="mt-2 text-sm text-[#6a6a6a]">
				{#if wooOrderId}Tu pedido #{wooOrderId} fue registrado correctamente.{:else}Tu pedido fue
					registrado correctamente.{/if}
			</p>
			<a
				href={store.basePath || '/'}
				class="mt-6 inline-block rounded-xl bg-[#2f3c4f] px-6 py-3 text-sm font-semibold tracking-[0.08em] text-white uppercase transition-colors hover:bg-[#253243]"
			>
				Volver a la tienda
			</a>
		{:else if status === 'declined'}
			<h1 class="font-['Volkhov',serif] text-2xl font-bold text-[#262635]">
				El pago no fue aprobado
			</h1>
			<p class="mt-2 text-sm text-[#6a6a6a]">Tu carrito sigue intacto, puedes intentar de nuevo.</p>
			<a
				href={`${store.basePath}/carrito`}
				class="mt-6 inline-block rounded-xl bg-[#2f3c4f] px-6 py-3 text-sm font-semibold tracking-[0.08em] text-white uppercase transition-colors hover:bg-[#253243]"
			>
				Volver al carrito
			</a>
		{:else if status === 'timeout'}
			<h1 class="font-['Volkhov',serif] text-2xl font-bold text-[#262635]">
				Confirmación pendiente
			</h1>
			<p class="mt-2 text-sm text-[#6a6a6a]">
				Wompi está tardando en confirmar tu pago. Te avisaremos por correo apenas se procese.
			</p>
		{:else}
			<h1 class="font-['Volkhov',serif] text-2xl font-bold text-[#262635]">
				No encontramos ese pago
			</h1>
			<p class="mt-2 text-sm text-[#6a6a6a]">Verifica el enlace o vuelve al carrito.</p>
			<a
				href={`${store.basePath}/carrito`}
				class="mt-6 inline-block rounded-xl bg-[#2f3c4f] px-6 py-3 text-sm font-semibold tracking-[0.08em] text-white uppercase transition-colors hover:bg-[#253243]"
			>
				Volver al carrito
			</a>
		{/if}
	</div>
</div>
