<script lang="ts">
	import { page } from '$app/state';
	import NewArrivals from '$lib/showcase/components/NewArrivals.svelte';
	import CatalogSection from '$lib/catalogHome/components/CatalogSection.svelte';
	import VendorCover from '$lib/storefront/components/VendorCover.svelte';
	import { HOUSE_STORE } from '$lib/storefront/model';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const store = $derived(page.data.storefront ?? HOUSE_STORE);
</script>

<svelte:head>
	<title>{store.name}</title>
</svelte:head>

<VendorCover {store} />

<section class="bg-gradient-to-b from-white to-white">
	<NewArrivals products={data.products} />
</section>

<hr class="mx-auto my-20 max-w-3xl border-t border-[#707070]" />

<CatalogSection products={data.products} />
