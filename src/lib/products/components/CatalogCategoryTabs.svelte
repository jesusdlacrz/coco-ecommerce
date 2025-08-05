<script lang="ts">
	import { categoryColors, type Category } from '$lib/shared/stores/categoryStore';

	interface Props {
		activeTab: Category;
		onTabChange: (tab: Category) => void;
	}

	let { activeTab, onTabChange }: Props = $props();

	const categories = [
		{ id: 'men', label: 'Hombres' },
		{ id: 'women', label: 'Mujeres' },
		{ id: 'boys', label: 'Niños' },
		{ id: 'girls', label: 'Niñas' }
	] as const;

	function handleCategoryClick(categoryId: Category) {
		onTabChange(categoryId);
	}
</script>

<div class="mb-8">
	<div class="flex justify-center space-x-1 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
		{#each categories as category (category.id)}
			{@const isActive = activeTab === category.id}
			{@const colors = categoryColors[category.id]}
			<button
				onclick={() => handleCategoryClick(category.id)}
				class="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 {isActive 
					? `${colors.primary} text-white shadow-sm` 
					: 'text-gray-600 hover:text-gray-900 hover:bg-white'}"
			>
				{category.label}
			</button>
		{/each}
	</div>
</div>
