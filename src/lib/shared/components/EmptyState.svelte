<script lang="ts">
	import Button from '$lib/shared/components/form/Button.svelte';

	interface Props {
		title: string;
		description?: string;
		/** CTA opcional: si se pasan ambos, se muestra un botón que saca al usuario del vacío. */
		actionLabel?: string;
		actionHref?: string;
		/** `compact` para paneles laterales; `page` para una pantalla entera. */
		size?: 'compact' | 'page';
	}

	let { title, description, actionLabel, actionHref, size = 'compact' }: Props = $props();

	const wrapper = size === 'page' ? 'py-20' : 'py-10';
	const titleClass = size === 'page' ? 'font-display text-3xl' : 'font-display text-2xl';
</script>

<div class="flex {wrapper} items-center justify-center px-4 text-center">
	<div>
		<p class="{titleClass} text-ink">{title}</p>
		{#if description}
			<p class="mx-auto mt-2 max-w-xs text-sm text-muted-soft">{description}</p>
		{/if}
		{#if actionLabel && actionHref}
			<Button href={actionHref} size="sm" class="mt-5">{actionLabel}</Button>
		{/if}
	</div>
</div>
