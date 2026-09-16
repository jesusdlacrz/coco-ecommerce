<script lang="ts">
	import { page } from '$app/state';

	interface Props {
		children?: import('svelte').Snippet;
	}
	const { children }: Props = $props();

	const store = $derived(page.data.storefront);
	const whatsappHref = $derived(
		store?.whatsapp ? `https://wa.me/${store.whatsapp.replace(/\D/g, '')}` : null
	);
</script>

<svelte:head>
	<!-- Las revistas de vendedor son para compartir por WhatsApp/Instagram, no
	     para competir en buscadores con el catálogo de la casa. -->
	<meta name="robots" content="noindex" />
</svelte:head>

{@render children?.()}

{#if whatsappHref}
	<a
		href={whatsappHref}
		target="_blank"
		rel="noopener"
		aria-label="Escríbenos por WhatsApp"
		class="fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105"
	>
		<svg viewBox="0 0 24 24" class="h-7 w-7" fill="currentColor">
			<path
				d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm5.78 14.16c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.3-1.63-.6-2.87-1.24-4.74-4.13-4.88-4.32-.14-.19-1.17-1.55-1.17-2.96 0-1.4.74-2.09 1-2.38.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.13.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.45.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.63-.15.26.1 1.63.77 1.91.91.28.14.47.21.53.33.07.12.07.68-.17 1.35Z"
			/>
		</svg>
	</a>
{/if}
