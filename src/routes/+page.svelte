<script lang="ts">
	import CatalogSection from '$lib/catalogHome/components/CatalogSection.svelte';
	import ModelGallery from '$lib/showcase/components/ModelGallery.svelte';
</script>

<svelte:head>
	<title>Coco's</title>
</svelte:head>
<section
	class="from-main relative min-h-screen overflow-hidden bg-gradient-to-t from-0% to-transparent to-30%"
>
	<ModelGallery />
</section>
<section class="from-main bg-gradient-to-b from-0% to-transparent to-30%">
	<CatalogSection />
</section>
