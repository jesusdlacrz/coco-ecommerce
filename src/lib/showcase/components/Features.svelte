<script lang="ts">
	// Los iconos eran ilustraciones de línea gruesa y con mucho detalle (una
	// medalla con cintas, un auricular con engranajes) traídas de un paquete
	// ajeno: rompían con el trazo fino y la sobriedad del resto de la página.
	// Aquí son trazos de 1px dibujados con la misma familia de formas que
	// Menu/ShoppingCart/Lock, y en el color de acento de la marca.
	interface Feature {
		readonly id: string;
		readonly title: string;
		readonly subtitle: string;
		readonly path: string;
	}

	const FEATURES: readonly Feature[] = [
		{
			id: 'quality',
			title: 'Calidad garantizada',
			subtitle: 'Confección con insumos de primera',
			path: 'M12 3l2.6 5.5 6 .9-4.3 4.3 1 6-5.3-2.9-5.3 2.9 1-6L3.4 9.4l6-.9L12 3z'
		},
		{
			id: 'warranty',
			title: 'Respaldo total',
			subtitle: 'Cobertura mayorista por 12 meses',
			path: 'M12 3l7 3v5.5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3zM9 12l2.2 2.2L15.4 10'
		},
		{
			id: 'shipping',
			title: 'Envío gratis',
			subtitle: 'En pedidos superiores a $200.000',
			path: 'M3 7.5L12 3l9 4.5v9L12 21 3 16.5v-9zM3 7.5L12 12m0 0l9-4.5M12 12v9'
		},
		{
			id: 'support',
			title: 'Atención especializada',
			subtitle: 'Acompañamiento continuo en tus pedidos',
			path: 'M21 15a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2h13a2 2 0 012 2v9zM9 10h6M9 13.5h4'
		}
	];
</script>

<!-- Franja centrada y con separadores finos en escritorio, en lugar de cuatro
     bloques con el icono al lado del texto: acompaña al header centrado. -->
<div class="py-16 sm:py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<ul
			class="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:divide-x lg:divide-line-soft"
		>
			{#each FEATURES as feature (feature.id)}
				<li class="flex items-start gap-4 lg:flex-col lg:items-center lg:gap-3 lg:px-6 lg:text-center">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-8 w-8 shrink-0 text-accent"
						aria-hidden="true"
					>
						<path d={feature.path} />
					</svg>
					<div>
						<p class="font-poppins text-[11px] font-medium uppercase tracking-[0.16em] text-ink">
							{feature.title}
						</p>
						<p class="mt-1.5 text-sm leading-relaxed text-muted-soft">{feature.subtitle}</p>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>
