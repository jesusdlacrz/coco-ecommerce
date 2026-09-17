<script lang="ts">
	import Skeleton from '../Skeleton.svelte';

	// Copia la ficha de producto: miniaturas + foto 3/4 a la izquierda, datos y
	// acciones a la derecha.
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<Skeleton class="mb-6 h-4 w-72" />

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<div class="flex items-start gap-3">
			<div class="flex w-[72px] shrink-0 flex-col gap-2">
				{#each Array.from({ length: 2 }, (_, i) => i) as thumb (thumb)}
					<Skeleton class="aspect-[3/4] w-full" />
				{/each}
			</div>
			<Skeleton class="aspect-[3/4] flex-1" />
		</div>

		<div class="space-y-6">
			<div class="space-y-3">
				<Skeleton class="h-9 w-2/3" />
				<Skeleton class="h-4 w-full" />
				<Skeleton class="h-8 w-40" />
				<Skeleton class="h-3 w-48" />
			</div>

			<div class="space-y-2">
				<Skeleton class="h-4 w-16" />
				<div class="flex gap-3">
					{#each Array.from({ length: 5 }, (_, i) => i) as size (size)}
						<Skeleton class="h-11 w-11" />
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Skeleton class="h-4 w-16" />
				<div class="flex gap-1">
					{#each Array.from({ length: 5 }, (_, i) => i) as color (color)}
						<Skeleton shape="circle" class="h-8 w-8" />
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Skeleton class="h-4 w-20" />
				<Skeleton class="h-11 w-32" />
			</div>

			<div class="flex flex-col gap-3 pt-4 sm:flex-row">
				<Skeleton class="h-12 flex-1" />
				<Skeleton class="h-12 flex-1" />
			</div>
		</div>
	</div>
</div>
