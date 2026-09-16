<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		footer?: { text: string; href: string; linkText: string };
		children: Snippet;
	}

	let { title, footer, children }: Props = $props();
</script>

<div class="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
	<h1 class="mb-6 font-display text-2xl font-bold text-[#262635]">{title}</h1>
	{@render children()}
	{#if footer}
		<p class="mt-6 text-center font-body text-sm text-[#767676]">
			{footer.text}
			<a href={footer.href} class="font-semibold text-[#262635] hover:underline"
				>{footer.linkText}</a
			>
		</p>
	{/if}
</div>
