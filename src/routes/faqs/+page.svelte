<script lang="ts">
	import GridFaq from '$lib/faqs/components/gridFAQ.svelte';

	import mujer from '$lib/assets/faqs/mujer.webp';
	import LogoVertical from '$lib/shared/icons/LogoVertical.svelte';
</script>

<section class="px-4 py-16 sm:px-8 sm:py-20 md:px-16 md:py-24 lg:px-32 xl:px-72">
	<div class="mx-auto max-w-screen-xl">
		<h2 class="text-3xl sm:text-4xl">FAQ'S</h2>
	</div>

	<GridFaq />
</section>
<svelte:head>
	<title>FAQ'S - Coco's</title>
</svelte:head>
<img
	src={mujer}
	alt="Mujer"
	class="fixed bottom-0 left-0 hidden w-32 sm:block md:w-48 lg:w-60 xl:w-72"
/>
