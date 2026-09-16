<script lang="ts">
	import { categoryColors, type Category as Gender } from '$lib/shared/stores/categoryStore';

	interface Props {
		activeTab: Gender;
		menProductsCount: number;
		womenProductsCount: number;
		boysProductsCount: number;
		girlsProductsCount: number;
		onTabChange: (tab: Gender) => void;
	}

	let {
		activeTab,
		menProductsCount,
		womenProductsCount,
		boysProductsCount,
		girlsProductsCount,
		onTabChange
	}: Props = $props();

	// Configuración de las categorías
	const categories = [
		{
			id: 'women' as Gender,
			label: 'Mujeres',
			count: womenProductsCount,
			activeColor: categoryColors.women.primary,
			hoverColor: categoryColors.women.primaryHover
		},
		{
			id: 'men' as Gender,
			label: 'Hombres',
			count: menProductsCount,
			activeColor: categoryColors.men.primary,
			hoverColor: categoryColors.men.primaryHover
		},
		{
			id: 'girls' as Gender,
			label: 'Niñas',
			count: girlsProductsCount,
			activeColor: categoryColors.girls.primary,
			hoverColor: categoryColors.girls.primaryHover
		},
		{
			id: 'boys' as Gender,
			label: 'Niños',
			count: boysProductsCount,
			activeColor: categoryColors.boys.primary,
			hoverColor: categoryColors.boys.primaryHover
		}
	] as const;

	const baseButtonClass =
		'flex flex-col items-center justify-center shadow-xl inset-shadow-2xs font-light space-y-1 text-sm rounded-lg px-4 py-3 transition-all duration-200 cursor-pointer';
	const inactiveClass = 'text-muted hover:text-ink';
	const activeClass = 'text-white shadow-md';
</script>

<div class="mb-8">
	<div class="grid grid-cols-2 gap-4 md:mx-16 md:grid-cols-4 md:gap-12">
		{#each categories as category (category.id)}
			<button
				onclick={() => onTabChange(category.id)}
				class="{baseButtonClass} {activeTab === category.id
					? `${category.activeColor} ${activeClass}`
					: `${inactiveClass} ${category.hoverColor}`}"
				aria-pressed={activeTab === category.id}
				aria-label={`Ver productos de ${category.label.toLowerCase()}`}
			>
				<span>{category.label}</span>
			</button>
		{/each}
	</div>
</div>
