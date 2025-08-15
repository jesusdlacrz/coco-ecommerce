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
	<div class="flex justify-center space-x-1  p-1 rounded-lg max-w-md mx-auto">
		{#each categories as category (category.id)}
			{@const isActive = activeTab === category.id}
			{@const colors = categoryColors[category.id]}
			<button
				onclick={() => handleCategoryClick(category.id)}
				class="flex-1 py-1 text-sm font-medium transition-all duration-200 cursor-pointer {isActive 
					? `border-b-2 ${colors.border} ${colors.text}` 
					: 'border-b-2 border-transparent text-[#262635]'}"
					style="font-family: 'Poppins', sans-serif;"
			>
				{category.label}
			</button>
		{/each}
	</div>
</div>
