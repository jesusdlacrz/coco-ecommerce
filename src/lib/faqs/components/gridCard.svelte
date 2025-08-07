<script lang="ts">
	import type { FAQ } from '../const/faqs.const';

	const { faq }: { faq: FAQ } = $props();
</script>

<div
	class="flex min-h-[300px] flex-col justify-start rounded-lg bg-white p-8 shadow transition-shadow duration-200 hover:shadow-lg"
>
	<!-- Contenedor del título + línea -->
	<div class="mb-4">
		<h4 class="text-graybrand-dark min-h-[60px] text-xl font-semibold">
			{faq.question}
		</h4>
		<hr class="border-graybrand w-full border-1 border-t" />
	</div>

	<!-- Contenido -->
	<p class="text-graybrand-light">{faq.answer}</p>
</div>
