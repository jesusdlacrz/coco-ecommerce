<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'error' | 'success';
		children: Snippet;
	}

	let { variant = 'error', children }: Props = $props();

	const variantClass = {
		error: 'border-red-200 bg-red-50 text-red-700',
		success: 'border-success/20 bg-success/10 text-success'
	}[variant];
</script>

<div
	role="alert"
	class="rounded-lg border px-4 py-3 font-body text-sm {variantClass}"
>
	{@render children()}
</div>
