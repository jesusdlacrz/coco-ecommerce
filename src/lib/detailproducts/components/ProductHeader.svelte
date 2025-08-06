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

	const backButtonText = fromProductsPage ? 'Volver a productos' : 'Volver al catálogo';
</script>

<!-- Header con botón de regreso -->
<div class="bg-white shadow-sm border-b">
	<div class="max-w-7xl mx-auto px-4 py-4">
		<button 
			onclick={goBack}
			class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
		>
			<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
			</svg>
			{backButtonText}
		</button>
	</div>
</div>
