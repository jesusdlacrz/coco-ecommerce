<script lang="ts">
	import Logo from '$lib/shared/icons/Logo.svelte';
	import mujer from '$lib/assets/faqs/mujer.webp';

	interface Props {
		children?: import('svelte').Snippet;
	}
	const { children }: Props = $props();
</script>

<div class="bg-graybrand relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
	<div class="relative z-10 w-full max-w-md">
		<a
			href="/"
			class="mb-8 flex justify-center opacity-90 transition-opacity hover:opacity-100"
			aria-label="Ir al inicio de Coco's"
		>
			<Logo />
		</a>
		{@render children?.()}

		<!-- Salida explícita: el logo ya enlaza al inicio, pero sin una señal
			 visible nadie lo descubre — estas páginas no tienen el header normal
			 del sitio, así que sin esto se siente un callejón sin salida. -->
		<a
			href="/"
			class="mt-6 flex items-center justify-center gap-1.5 font-body text-sm text-muted transition-colors hover:text-ink"
		>
			<svg
				class="h-4 w-4"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
			Volver a la tienda
		</a>
	</div>

	<img
		src={mujer}
		alt=""
		class="pointer-events-none fixed bottom-0 left-0 hidden w-32 sm:block md:w-48 lg:w-60 xl:w-72"
	/>
</div>
