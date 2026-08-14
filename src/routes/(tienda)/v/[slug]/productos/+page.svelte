<script lang="ts">
	import CatalogPage from '$lib/products/pages/CatalogPage.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<CatalogPage products={data.products} />
