<script lang="ts">
	import { goBack } from '$lib/shared/services/goBack.svelte';
	type Props = {
		category?: string;
		fromProductsPage?: boolean;
	};

	let { category, fromProductsPage = false }: Props = $props();

	const backButtonText = fromProductsPage ? 'Volver a productos' : 'Volver al catálogo';
</script>

<!-- Header con botón de regreso -->
<div class="border-b bg-white shadow-sm">
	<div class="mx-auto max-w-7xl px-4 py-4">
		<button
			onclick={goBack}
			class="inline-flex items-center text-gray-600 transition-colors hover:text-gray-900"
		>
			<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
				></path>
			</svg>
			{backButtonText}
		</button>
	</div>
</div>
