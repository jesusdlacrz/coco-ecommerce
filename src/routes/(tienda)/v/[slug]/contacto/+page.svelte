<script lang="ts">
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';

	const store = $derived(page.data.storefront ?? HOUSE_STORE);
	const whatsappHref = $derived(
		store.whatsapp ? `https://wa.me/${store.whatsapp.replace(/\D/g, '')}` : null
	);
</script>

<svelte:head>
	<title>Contacto - {store.name}</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
	<h1 class="font-['Volkhov',serif] text-3xl font-bold text-[#262635]">Contáctanos</h1>
	<p class="mt-3 font-['Jost',sans-serif] text-[#767676]">
		¿Tienes preguntas sobre algún producto? Escríbenos directamente.
	</p>
	{#if whatsappHref}
		<a
			href={whatsappHref}
			target="_blank"
			rel="noopener"
			class="mt-8 inline-block rounded-xl bg-[#25D366] px-10 py-4 text-sm font-medium text-white shadow-lg transition-all hover:opacity-90"
		>
			Escribir por WhatsApp
		</a>
	{:else}
		<p class="mt-8 font-['Jost',sans-serif] text-sm text-[#a0a0a0]">
			Esta tienda todavía no configuró un WhatsApp de contacto.
		</p>
	{/if}
</div>
