<script lang="ts">
	import '../app.css';
	import Header from '$lib/shared/components/Header.svelte';

	interface Props {
		children?: import('svelte').Snippet<[unknown]>;
	}
	const { children }: Props = $props();
	let searchQuery = $state('');
</script>

<Header bind:searchQuery />
<main>
	{@render children?.({ searchQuery })}
</main>
