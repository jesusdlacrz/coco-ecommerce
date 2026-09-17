<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		target?: HTMLElement | null;
		children: Snippet;
	}

	let { target = null, children }: Props = $props();

	let container = $state<HTMLDivElement | null>(null);

	// Mover el contenedor fuera de su sitio en el árbol, y retirarlo al final, es
	// precisamente la función de un portal: sacar el modal del contexto de
	// apilamiento del padre. Svelte sigue siendo el dueño de lo que hay DENTRO
	// del div; aquí solo se reubica el envoltorio.
	onMount(() => {
		(target ?? document.body).appendChild(container!);
	});

	onDestroy(() => {
		// eslint-disable-next-line svelte/no-dom-manipulating
		container?.remove();
	});
</script>

<!-- `display: contents` para que el envoltorio no cree caja propia. Antes decía
     style="contents", que no es CSS válido y el div sí ocupaba layout. -->
<div bind:this={container} style="display: contents">
	{@render children()}
</div>
