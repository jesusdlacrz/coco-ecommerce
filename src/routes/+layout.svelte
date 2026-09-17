<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-5-french-toast';
	import { onMount } from 'svelte';
	import { startOverlayGuardian } from '$lib/shared/services/overlays';

	interface Props {
		children?: import('svelte').Snippet;
	}
	const { children }: Props = $props();

	// Red de seguridad permanente: si alguna capa a pantalla completa se queda
	// pegada, esto la neutraliza y devuelve la página al usuario en un segundo
	// en vez de dejarla inutilizable hasta recargar.
	onMount(() => startOverlayGuardian());
</script>

<Toaster />
{@render children?.()}
