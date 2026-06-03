<script lang="ts">
	import { goto } from '$app/navigation';
	import { transitions } from '$lib/shared/services/transitions.svelte';

	let { href, class: className = '', hero = true, children, ...props } = $props();

	async function handleClick(event: { preventDefault: () => void }) {
		event.preventDefault();

		if (hero) {
			await transitions.navigateWithTransition(href, () => {
				goto(href);
			});
		} else {
			await transitions.navigateWithoutSharedElements(href, () => {
				goto(href);
			});
		}
	}
</script>

<a {href} class={className} onclick={handleClick} {...props}>
	{@render children()}
</a>
