<script lang="ts">
	import GridCard from './gridCard.svelte';
	import { faqs as defaultFaqs, type FAQ } from '../const/faqs.const';

	// Preguntas gestionadas en WordPress; si no hay ninguna cargada, se
	// muestran las originales.
	let { items = [] }: { items?: FAQ[] } = $props();

	const faqs = $derived(items.length ? items : defaultFaqs);
</script>

<section
	class="bg-graybrand mx-auto max-w-screen-xl rounded-2xl px-4 py-8 shadow-2xl sm:px-6 md:px-8"
>
	<h3 class="text-graybrand-light mb-6 text-lg font-light sm:text-xl">Preguntas de ayuda</h3>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<!-- Clave por posición: dos preguntas iguales cargadas en WordPress
		     romperían una clave por texto. -->
		{#each faqs as faq, i (i)}
			<GridCard {faq} />
		{/each}
	</div>
</section>
