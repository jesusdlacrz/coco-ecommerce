<script lang="ts">
	import Skeleton from '../Skeleton.svelte';

	// Refleja la estructura real de /productos: pestañas de categoría, panel de
	// filtros a la izquierda y grilla de tarjetas. Un esqueleto que no coincide
	// con lo que va a aparecer produce un salto de layout al llegar los datos,
	// que es peor que no poner nada.
	const CARDS = 6;
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-8 flex justify-center gap-8">
		{#each Array.from({ length: 4 }, (_, i) => i) as i (i)}
			<Skeleton class="h-5 w-20" />
		{/each}
	</div>

	<div class="lg:grid lg:grid-cols-4 lg:gap-8">
		<aside class="hidden lg:block">
			<Skeleton class="mb-5 h-6 w-24" />
			{#each Array.from({ length: 3 }, (_, i) => i) as section (section)}
				<div class="mb-6 space-y-3">
					<Skeleton class="h-3 w-20" />
					<Skeleton class="h-9 w-full" />
					<Skeleton class="h-9 w-4/5" />
				</div>
			{/each}
		</aside>

		<div class="mt-6 lg:col-span-3 lg:mt-0">
			<Skeleton class="mb-4 h-4 w-48" />
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each Array.from({ length: CARDS }, (_, i) => i) as card (card)}
					<div class="space-y-3">
						<Skeleton class="aspect-[3/4] w-full" />
						<Skeleton class="h-4 w-3/4" />
						<Skeleton class="h-5 w-24" />
						<div class="flex gap-1.5">
							{#each Array.from({ length: 4 }, (_, j) => j) as dot (dot)}
								<Skeleton shape="circle" class="h-5 w-5" />
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
