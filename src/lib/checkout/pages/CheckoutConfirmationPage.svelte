<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { cartStore } from '$lib/cart/stores/cartStore';
	import { HOUSE_STORE } from '$lib/storefront/model';
	import Button from '$lib/shared/components/form/Button.svelte';

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
				class="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-line border-t-ink"
			></div>
			<h1 class="font-display text-2xl font-bold text-ink">
				Confirmando tu pago...
			</h1>
			<p class="mt-2 text-sm text-muted-soft">No cierres esta ventana.</p>
		{:else if status === 'approved'}
			<h1 class="font-display text-2xl font-bold text-ink">¡Pago aprobado!</h1>
			<p class="mt-2 text-sm text-muted-soft">
				{#if wooOrderId}Tu pedido #{wooOrderId} fue registrado correctamente.{:else}Tu pedido fue
					registrado correctamente.{/if}
			</p>
			<Button variant="secondary" href={store.basePath || '/'} class="mt-6">
				Volver a la tienda
			</Button>
		{:else if status === 'declined'}
			<h1 class="font-display text-2xl font-bold text-ink">
				El pago no fue aprobado
			</h1>
			<p class="mt-2 text-sm text-muted-soft">Tu carrito sigue intacto, puedes intentar de nuevo.</p>
			<Button variant="secondary" href={`${store.basePath}/carrito`} class="mt-6">
				Volver al carrito
			</Button>
		{:else if status === 'timeout'}
			<h1 class="font-display text-2xl font-bold text-ink">
				Confirmación pendiente
			</h1>
			<p class="mt-2 text-sm text-muted-soft">
				Wompi está tardando en confirmar tu pago. Te avisaremos por correo apenas se procese.
			</p>
		{:else}
			<h1 class="font-display text-2xl font-bold text-ink">
				No encontramos ese pago
			</h1>
			<p class="mt-2 text-sm text-muted-soft">Verifica el enlace o vuelve al carrito.</p>
			<Button variant="secondary" href={`${store.basePath}/carrito`} class="mt-6">
				Volver al carrito
			</Button>
		{/if}
	</div>
</div>
