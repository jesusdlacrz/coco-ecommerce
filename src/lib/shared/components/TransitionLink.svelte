<script lang="ts">
	import { goto } from '$app/navigation';
	import { transitions } from '$lib/shared/services/transitions.svelte';

	let { href, class: className = '', children, ...props } = $props();

	async function handleClick(event: { preventDefault: () => void }) {
		event.preventDefault();

		await transitions.navigateWithTransition(href, () => {
			goto(href);
		});
	}
</script>

<a {href} class={className} onclick={handleClick} {...props}>
	{@render children()}
</a>
