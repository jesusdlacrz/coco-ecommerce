<script lang="ts">
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';
</script>

<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="text-center text-[#484848]">
		<h1 class="mb-6 text-3xl font-bold" style="font-family: 'Volkhov', serif;">
			Productos
		</h1>
		<p class="mb-8 text-lg text-[#8A8A8A]">
			El catálogo principal está en la página de inicio
		</p>
		
		<TransitionLink 
			href="/" 
			class="inline-block rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 transition-colors"
		>
			← Volver al Catálogo
		</TransitionLink>
	</div>
</main>
