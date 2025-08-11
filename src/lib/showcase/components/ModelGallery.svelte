<script lang="ts">
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';
</script>


	<!-- Contenedor principal -->
	<div class="container mx-auto flex h-screen flex-col px-4 py-8">
		<!-- Grid principal con las imágenes y contenido central -->
		<div class="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Imagen izquierda - Hombre sentado -->
			<div class="relative h-full min-h-[400px] lg:min-h-[600px]">
				<div class="absolute inset-0 overflow-hidden rounded-2xl bg-gray-200 shadow-lg">
					<img
						src="/placeholder.svg?height=600&width=400"
						alt="Modelo masculino con ropa casual"
						class="h-full w-full object-cover"
					/>
				</div>
			</div>

			<!-- Contenido central -->
			<div class="flex flex-col items-center gap-24 px-4">
				<!-- Ima    gen superior - Grupo de mujeres -->
				<div class=" h-32 w-full max-w-md lg:h-40">
					<div class="h-full overflow-hidden rounded-2xl bg-gray-200 shadow-lg">
						<img
							src="/placeholder.svg?height=160&width=400"
							alt="Grupo de mujeres elegantes"
							class="h-full w-full object-cover"
						/>
					</div>
				</div>

				<!-- Texto principal -->
				<div class="font-poppins text-center">
					<h1 class="text-4xl font-bold tracking-tight text-gray-800 lg:text-6xl xl:text-7xl">
						ULTIMATE
					</h1>
					<h2
						class="bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-500 bg-clip-text text-7xl font-bold tracking-tight text-transparent lg:text-8xl xl:text-9xl"
					>
						SALE
					</h2>
					<p class="my-6 text-lg font-medium tracking-wide text-gray-600 lg:text-xl">
						NUEVA COLECCIÓN
					</p>
					<!-- Botón de compra -->
					<TransitionLink
						href="/productos"
						class="text-md transform rounded-2xl bg-black px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-xl"
					>
						Comprar ahora
					</TransitionLink>
				</div>
			</div>

			<!-- Imagen derecha - Hombre con cabello rizado -->
			<div class="relative h-full min-h-[400px] lg:min-h-[600px]">
				<div class="absolute inset-0 overflow-hidden rounded-2xl bg-gray-200 shadow-lg">
					<img
						src="/placeholder.svg?height=600&width=400"
						alt="Modelo masculino con suéter naranja"
						class="h-full w-full object-cover"
					/>
				</div>
			</div>
		</div>

		<!-- Sección de marcas -->
	</div>

