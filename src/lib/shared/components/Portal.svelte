<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		target?: HTMLElement | null;
		children: Snippet;
	}

	let { target = null, children }: Props = $props();

	let container = $state<HTMLDivElement | null>(null);

	onMount(() => {
		(target ?? document.body).appendChild(container!);
	});

	onDestroy(() => {
		container?.remove();
	});
</script>

<!-- `display: contents` para que el envoltorio no cree caja propia. Antes decía
     style="contents", que no es CSS válido y el div sí ocupaba layout. -->
<div bind:this={container} style="display: contents">
	{@render children()}
</div>
