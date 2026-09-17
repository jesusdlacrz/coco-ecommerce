<script lang="ts">
	interface Props {
		/** Clases de tamaño/forma: `h-4 w-32`, `aspect-[3/4] w-full`, etc. */
		class?: string;
		/** `circle` para avatares y puntos. */
		shape?: 'block' | 'circle';
	}

	let { class: className = '', shape = 'block' }: Props = $props();

	// El pulso se apaga solo para quien pide menos movimiento: app.css neutraliza
	// las animaciones bajo `prefers-reduced-motion`, así que aquí no hace falta
	// repetir la media query.
	const radius = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
</script>

<div class="animate-pulse bg-line-soft {radius} {className}" aria-hidden="true"></div>
