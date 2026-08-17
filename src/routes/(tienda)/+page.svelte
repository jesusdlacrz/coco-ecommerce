<script lang="ts">
	import ModelGallery from '$lib/showcase/components/ModelGallery.svelte';

	import NewArrivals from '$lib/showcase/components/NewArrivals.svelte';
	import CatalogSection from '$lib/catalogHome/components/CatalogSection.svelte';
	import Features from '$lib/showcase/components/Features.svelte';
	import InstagramGallery from '$lib/showcase/components/InstagramGallery.svelte';
	import Testimonials from '$lib/showcase/components/Testimonials.svelte';
	import AboutSection from '$lib/showcase/components/AboutSection.svelte';
	import Footer from '$lib/shared/components/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Coco's</title>
</svelte:head>

<!-- Hero -->
<section class="relative min-h-screen overflow-hidden bg-gradient-to-t from-[#FCA12054] to-white">
	<ModelGallery
		products={data.products}
		copy={data.siteContent?.copy}
		heroImages={data.siteContent?.heroImages}
	/>
</section>

<!-- Lo Más Nuevo -->
<section class="bg-gradient-to-b from-white to-white">
	<NewArrivals products={data.products} copy={data.siteContent?.copy} />
</section>

<hr class="mx-auto my-20 max-w-3xl border-t border-[#707070]" />

<!-- Catálogo con tabs -->
<section class="">
	<CatalogSection products={data.products} />
</section>

<!-- Features bar -->
<Features />

<!-- Instagram Gallery -->
<InstagramGallery images={data.siteContent?.instagram} />

<!-- Testimonios -->
<Testimonials testimonials={data.siteContent?.testimonials} />

<!-- Nosotros + Footer dentro del mismo degradado -->
<div class="bg-gradient-to-b from-white via-[#fca12014] to-[#fca12030]">
	<AboutSection slides={data.siteContent?.about} />
	<Footer />
</div>
