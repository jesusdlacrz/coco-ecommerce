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
	<div class="flex space-x-1 p-1 bg-gray-100 rounded-full">
		<button
			onclick={() => onTabChange('men')}
			class="flex flex-1 items-center justify-center font-light space-x-2 text-sm rounded-full px-6 py-3 transition-all duration-200 {activeTab === 'men'
				? 'bg-black text-white shadow-md'
				: 'text-gray-700 hover:text-gray-900 hover:bg-white'}"
		>
			<span>Hombres</span>
			<span class="text-xs opacity-75">({menProductsCount})</span>
		</button>
		<button
			onclick={() => onTabChange('women')}
			class="flex flex-1 items-center justify-center font-light space-x-2 text-sm rounded-full px-6 py-3 transition-all duration-200 {activeTab === 'women'
				? 'bg-black text-white shadow-md'
				: 'text-gray-700 hover:text-gray-900 hover:bg-white'}"
		>
			<span>Mujeres</span>
			<span class="text-xs opacity-75">({womenProductsCount})</span>
		</button>
	</div>
</div>
