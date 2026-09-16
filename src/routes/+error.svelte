<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/shared/components/form/Button.svelte';
</script>

<svelte:head>
	<title>{page.status} - Coco's</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
	<p class="font-display text-6xl font-bold text-ink">{page.status}</p>
	<p class="font-body text-muted-soft">
		{page.error?.message ?? 'Ocurrió un error inesperado'}
	</p>
	<Button variant="secondary" href="/" class="mt-2">Volver al inicio</Button>
</div>
