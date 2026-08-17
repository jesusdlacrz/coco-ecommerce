<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div
	role="alert"
	class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-['Jost',sans-serif] text-sm text-red-700"
>
	{@render children()}
</div>
