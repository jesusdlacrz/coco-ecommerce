<script lang="ts">
	import { categoryColors, type Category } from '$lib/shared/stores/categoryStore';

	interface Props {
		activeTab: Category;
		onTabChange: (tab: Category) => void;
	}

	let { activeTab, onTabChange }: Props = $props();

	const categories = [

		{ id: 'women', label: 'Mujeres' },
		{ id: 'men', label: 'Hombres' },
		{ id: 'girls', label: 'Niñas' },
		{ id: 'boys', label: 'Niños' },

	] as const;

	function handleCategoryClick(categoryId: Category) {
		onTabChange(categoryId);
	}
</script>

<div class="mb-8 lg:grid lg:grid-cols-4">
	<div class="lg:col-start-2">
	<div class="flex justify-start space-x-8 p-1 rounded-lg">
		{#each categories as category (category.id)}
			{@const isActive = activeTab === category.id}
			{@const colors = categoryColors[category.id]}
			<button
				onclick={() => handleCategoryClick(category.id)}
				class="flex-1 py-0.5 text-sm font-medium transition-all duration-200 min-w-18 cursor-pointer {isActive 
					? `border-b-2 ${colors.border} ${colors.text}` 
					: 'border-b-2 border-transparent text-ink'}"
					style="font-family: 'Poppins', sans-serif;"
			>
				{category.label}
			</button>
		{/each}
		</div>
	</div>
</div>
