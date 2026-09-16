<script lang="ts">
	import type { Snippet } from 'svelte';
	import { buttonClass, type ButtonSize, type ButtonVariant } from './buttonStyles';

	interface Props {
		type?: 'button' | 'submit';
		variant?: ButtonVariant;
		size?: ButtonSize;
		loading?: boolean;
		disabled?: boolean;
		href?: string; // si se pasa, se renderiza como enlace con el mismo aspecto
		target?: string;
		rel?: string;
		class?: string;
		onclick?: () => void;
		children: Snippet;
	}

	let {
		type = 'button',
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		href,
		target,
		rel,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const classes = $derived(buttonClass(variant, size, className));
</script>

{#snippet content()}
	{#if loading}
		<span
			class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
			aria-hidden="true"
		></span>
	{/if}
	{@render children()}
{/snippet}

{#if href}
	<a {href} {target} {rel} class={classes}>
		{@render content()}
	</a>
{:else}
	<button {type} {onclick} disabled={disabled || loading} class={classes}>
		{@render content()}
	</button>
{/if}
