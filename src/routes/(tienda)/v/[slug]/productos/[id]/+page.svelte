<script lang="ts">
	import ProductDetailPage from '$lib/detailproducts/pages/ProductDetailPage.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<ProductDetailPage product={data.product} />
