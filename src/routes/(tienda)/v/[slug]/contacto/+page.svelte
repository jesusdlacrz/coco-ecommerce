<script lang="ts">
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';
	import Button from '$lib/shared/components/form/Button.svelte';

	const store = $derived(page.data.storefront ?? HOUSE_STORE);
	const whatsappHref = $derived(
		store.whatsapp ? `https://wa.me/${store.whatsapp.replace(/\D/g, '')}` : null
	);
</script>

<svelte:head>
	<title>Contacto - {store.name}</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
	<h1 class="font-display text-3xl font-bold text-ink">Contáctanos</h1>
	<p class="mt-3 font-body text-muted-soft">
		¿Tienes preguntas sobre algún producto? Escríbenos directamente.
	</p>
	{#if whatsappHref}
		<Button
			variant="whatsapp"
			href={whatsappHref}
			target="_blank"
			rel="noopener"
			class="mt-8 shadow-lg"
		>
			Escribir por WhatsApp
		</Button>
	{:else}
		<p class="mt-8 font-body text-sm text-muted-faint">
			Esta tienda todavía no configuró un WhatsApp de contacto.
		</p>
	{/if}
</div>
