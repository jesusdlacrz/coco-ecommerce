<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} - Coco's</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
	<p class="font-['Volkhov',serif] text-6xl font-bold text-[#262635]">{page.status}</p>
	<p class="font-['Jost',sans-serif] text-[#767676]">
		{page.error?.message ?? 'Ocurrió un error inesperado'}
	</p>
	<a
		href="/"
		class="mt-2 rounded-lg bg-[#262635] px-6 py-3 font-['Volkhov',serif] font-semibold text-white transition-colors hover:bg-black"
	>
		Volver al inicio
	</a>
</div>
