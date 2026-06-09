<script lang="ts">
	import ModelGallery from '$lib/showcase/components/ModelGallery.svelte';

	import NewArrivals from '$lib/showcase/components/NewArrivals.svelte';
	import CatalogSection from '$lib/catalogHome/components/CatalogSection.svelte';
	import Features from '$lib/showcase/components/Features.svelte';
	import InstagramGallery from '$lib/showcase/components/InstagramGallery.svelte';
	import Testimonials from '$lib/showcase/components/Testimonials.svelte';
	import AboutSection from '$lib/showcase/components/AboutSection.svelte';
	import Footer from '$lib/shared/components/Footer.svelte';
</script>

<svelte:head>
	<title>Coco's</title>
</svelte:head>

<!-- Hero -->
<section class="relative min-h-screen overflow-hidden bg-gradient-to-t from-[#FCA12054] to-white">
	<ModelGallery />
</section>

<!-- Lo Más Nuevo -->
<section class="bg-gradient-to-b from-white to-white">
<NewArrivals />
</section>

<hr class="mx-auto my-20 max-w-3xl border-t border-[#707070]" />

<!-- Catálogo con tabs -->
<section class="">
	<CatalogSection />
</section>

<!-- Features bar -->
<Features />

<!-- Instagram Gallery -->
<InstagramGallery />

<!-- Testimonios -->
<Testimonials />

<!-- Nosotros + Footer dentro del mismo degradado -->
<div class="bg-gradient-to-b from-white via-[#fca12014] to-[#fca12030]">
	<AboutSection />
	<Footer />
</div>
