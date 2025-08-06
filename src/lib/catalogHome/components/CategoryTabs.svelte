<script lang="ts">
	type Gender = 'men' | 'women' | 'boys' | 'girls';

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
			id: 'men' as Gender,
			label: 'Hombres',
			count: menProductsCount,
			activeColor: 'bg-[#16167F]',
			hoverColor: 'hover:bg-[#2c71cc41]'
		},
		{
			id: 'women' as Gender,
			label: 'Mujeres',
			count: womenProductsCount,
			activeColor: 'bg-[#7C00F4]',
			hoverColor: 'hover:bg-[#b19ade36]'
		},
		{
			id: 'boys' as Gender,
			label: 'Niños',
			count: boysProductsCount,
			activeColor: 'bg-[#6296DB]',
			hoverColor: 'hover:bg-[#6296db38]'
		},
		{
			id: 'girls' as Gender,
			label: 'Niñas',
			count: girlsProductsCount,
			activeColor: 'bg-[#FF91C0]',
			hoverColor: 'hover:bg-[#ff91c136]'
		}
	] as const;

	const baseButtonClass = "flex flex-col items-center justify-center shadow-xl font-light space-y-1 text-sm rounded-lg px-4 py-3 transition-all duration-200 cursor-pointer";
	const inactiveClass = "text-gray-700 hover:text-gray-900";
	const activeClass = "text-white shadow-md";
</script>

<div class="mb-8">
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 md:mx-16">
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
