<script>
	import GridCard from './gridCard.svelte';
	import { faqs } from '../const/faqs.const';
</script>

<section
	class="bg-graybrand mx-auto max-w-screen-xl rounded-2xl px-4 py-8 shadow-2xl sm:px-6 md:px-8"
>
	<h3 class="text-graybrand-light mb-6 text-lg font-light sm:text-xl">Preguntas de ayuda</h3>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each faqs as faq}
			<GridCard {faq} />
		{/each}
	</div>
</section>
