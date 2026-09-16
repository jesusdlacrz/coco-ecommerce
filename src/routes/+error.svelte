<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} - Coco's</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
	<p class="font-display text-6xl font-bold text-ink">{page.status}</p>
	<p class="font-body text-muted-soft">
		{page.error?.message ?? 'Ocurrió un error inesperado'}
	</p>
	<a
		href="/"
		class="mt-2 rounded-lg bg-ink px-6 py-3 font-display font-semibold text-white transition-colors hover:bg-black"
	>
		Volver al inicio
	</a>
</div>
