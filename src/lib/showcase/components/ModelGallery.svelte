<script lang="ts">
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

	<!-- MÓVIL: flex-col con reordenamiento. ESCRITORIO: grid 3 columnas -->
	<div class="flex flex-col gap-5 lg:grid lg:items-start lg:gap-6" style="grid-template-columns: 1fr 1.5fr 1fr;">

		<!-- Imagen izquierda — oculta en móvil, aparece en lg (col 1, row 1) -->
		<div
			class="hidden w-full overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-lg lg:block"
			style="aspect-ratio: 1/2; grid-column: 1; grid-row: 1;"
		>
			<img src="/placeholder.svg?height=900&width=600" alt="Modelo izquierda" class="h-full w-full object-cover object-top" />
		</div>

		<!-- Columna central — en lg ocupa col 2, row 1 -->
		<div class="flex flex-col items-center" style="grid-column: 2; grid-row: 1;">

			<!-- Texto + botón: order-1 en móvil (va primero), luego imagen -->
			<div class="order-1 flex flex-col items-center gap-5 py-6 text-center font-['Poppins',sans-serif] lg:order-2 lg:mt-8 lg:py-0">
				<div>
					<h1 class="font-bold tracking-tight text-[#484848]" style="font-size: clamp(2rem, 5vw, 4rem); line-height: 1.1;">
						GRAN
					</h1>
					<h2
						class="bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-500 bg-clip-text font-bold tracking-tight text-transparent"
						style="font-size: clamp(3rem, 8vw, 6.5rem); line-height: 1;"
					>
						OFERTA
					</h2>
					<p class="mt-3 text-sm font-medium tracking-[3px] uppercase text-[#484848] lg:text-base">
						NUEVA COLECCIÓN
					</p>
				</div>
				<TransitionLink
					href="/productos"
					hero={false}
					class="inline-block rounded-xl bg-black px-10 py-4 text-sm font-medium text-white shadow-[0px_20px_35px_0px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-xl"
				>
					Comprar ahora
				</TransitionLink>
			</div>

			<!-- Imagen horizontal: order-2 en móvil (va después del texto) -->
			<div class="order-2 w-full overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-lg lg:order-1" style="aspect-ratio: 3/1;">
				<img src="/placeholder.svg?height=200&width=600" alt="Grupo" class="h-full w-full object-cover" />
			</div>

		</div>

		<!-- Imagen derecha — oculta en móvil en lg, col 3, row 1 -->
		<div
			class="hidden w-full overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-lg lg:block"
			style="aspect-ratio: 1/2; grid-column: 3; grid-row: 1;"
		>
			<img src="/placeholder.svg?height=900&width=600" alt="Modelo derecha" class="h-full w-full object-cover object-top" />
		</div>

		<!-- Sub-grid de imágenes laterales para móvil (order-3, visible solo en < lg) -->
		<div class="order-3 grid grid-cols-2 gap-3 lg:hidden">
			<div class="overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-lg" style="aspect-ratio: 1/2;">
				<img src="/placeholder.svg?height=900&width=600" alt="Modelo izquierda" class="h-full w-full object-cover object-top" />
			</div>
			<div class="overflow-hidden rounded-2xl bg-[#d5d5d5] shadow-lg" style="aspect-ratio: 1/2;">
				<img src="/placeholder.svg?height=900&width=600" alt="Modelo derecha" class="h-full w-full object-cover object-top" />
			</div>
		</div>

	</div>
</div>
