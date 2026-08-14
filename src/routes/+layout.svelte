<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-5-french-toast';

	interface Props {
		children?: import('svelte').Snippet;
	}
	const { children }: Props = $props();
</script>

<Toaster />
{@render children?.()}
