<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'button' | 'submit';
		variant?: 'primary' | 'secondary' | 'text';
		loading?: boolean;
		disabled?: boolean;
		class?: string;
		onclick?: () => void;
		children: Snippet;
	}

	let {
		type = 'button',
		variant = 'primary',
		loading = false,
		disabled = false,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const variantClass = {
		primary: 'bg-[#FCA120] text-[#262635] hover:bg-[#e8931a] disabled:hover:bg-[#FCA120]',
		secondary: 'bg-[#262635] text-white hover:bg-black disabled:hover:bg-[#262635]',
		text: 'bg-transparent text-[#262635] hover:underline disabled:hover:no-underline'
	}[variant];
</script>

<button
	{type}
	{onclick}
	disabled={disabled || loading}
	class="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-['Volkhov',serif] font-semibold transition-colors active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 {variantClass} {className}"
>
	{#if loading}
		<span
			class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
			aria-hidden="true"
		></span>
	{/if}
	{@render children()}
</button>
