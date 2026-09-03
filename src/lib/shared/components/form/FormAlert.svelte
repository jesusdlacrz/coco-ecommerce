<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'error' | 'success';
		children: Snippet;
	}

	let { variant = 'error', children }: Props = $props();

	const variantClass = {
		error: 'border-red-200 bg-red-50 text-red-700',
		success: 'border-[#1f8a55]/20 bg-[#1f8a55]/10 text-[#1f8a55]'
	}[variant];
</script>

<div
	role="alert"
	class="rounded-lg border px-4 py-3 font-['Jost',sans-serif] text-sm {variantClass}"
>
	{@render children()}
</div>
