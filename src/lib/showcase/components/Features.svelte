<script lang="ts">
	import highQualityIcon from '$lib/assets/high-quality.svg';
	import warrantyIcon from '$lib/assets/warranty.svg';
	import freeShippingIcon from '$lib/assets/free-shipping.svg';
	import supportIcon from '$lib/assets/support.svg';

	const features = [
		{ id: 'quality',  title: 'Calidad Garantizada',        subtitle: 'Confección con insumos de primera', icon: highQualityIcon },
		{ id: 'warranty', title: 'Respaldo Total',  subtitle: 'Cobertura mayorista por 12 meses',               icon: warrantyIcon },
		{ id: 'shipping', title: 'Envío Gratis',        subtitle: 'En pedidos superiores a $200.000',           icon: freeShippingIcon },
		{ id: 'support',  title: 'Atención Especializada',       subtitle: 'Acompañamiento continuo en tus pedidos',          icon: supportIcon }
	];
</script>

<div class="py-15">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
			{#each features as feature (feature.id)}
				<div class="flex flex-row items-center gap-4">
					<div class="shrink-0">
						<img
							src={feature.icon}
							alt={feature.title}
							class="h-14 w-14 object-contain"
						/>
					</div>
					<div>
						<p class="font-poppins font-medium text-[#484848]">{feature.title}</p>
						<p class="text-sm text-[#484848]">{feature.subtitle}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
