<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		footer?: { text: string; href: string; linkText: string };
		children: Snippet;
	}

	let { title, footer, children }: Props = $props();
</script>

<div class="rounded-2xl border border-line-soft bg-white p-6 shadow-sm sm:p-8">
	<h1 class="mb-6 font-display text-2xl font-bold text-ink">{title}</h1>
	{@render children()}
	{#if footer}
		<p class="mt-6 text-center font-body text-sm text-muted-soft">
			{footer.text}
			<a href={footer.href} class="font-semibold text-ink hover:underline"
				>{footer.linkText}</a
			>
		</p>
	{/if}
</div>
