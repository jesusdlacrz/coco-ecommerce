<script lang="ts">
	import { goto } from '$app/navigation';

	type Props = {
		category?: string;
		fromProductsPage?: boolean;
	};

	let { category, fromProductsPage = false }: Props = $props();

	function goBack() {
		if (fromProductsPage && category) {
			goto(`/productos?category=${category}`);
		} else if (category) {
			goto(`/?category=${category}`);
		} else {
			goto('/');
		}
	}

</script>
