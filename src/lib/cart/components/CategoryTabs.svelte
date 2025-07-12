<script lang="ts">
	interface Props {
		activeTab: 'men' | 'women';
		menProductsCount: number;
		womenProductsCount: number;
		onTabChange: (tab: 'men' | 'women') => void;
	}

	let { activeTab, menProductsCount, womenProductsCount, onTabChange }: Props = $props();
</script>

<div class="mb-8">
	<div class="flex space-x-1 rounded-lg bg-gray-100 p-1">
		<button
			onclick={() => onTabChange('men')}
			class="flex flex-1 items-center justify-center space-x-2 rounded-md px-4 py-2 transition-colors {activeTab ===
			'men'
				? 'bg-blue-600 text-white'
				: 'text-gray-700 hover:text-gray-900'}"
		>
			<div class="h-3 w-3 rounded-full bg-blue-600"></div>
			<span>Hombres ({menProductsCount})</span>
		</button>
		<button
			onclick={() => onTabChange('women')}
			class="flex flex-1 items-center justify-center space-x-2 rounded-md px-4 py-2 transition-colors {activeTab ===
			'women'
				? 'bg-pink-600 text-white'
				: 'text-gray-700 hover:text-gray-900'}"
		>
			<div class="h-3 w-3 rounded-full bg-pink-600"></div>
			<span>Mujeres ({womenProductsCount})</span>
		</button>
	</div>
</div>
