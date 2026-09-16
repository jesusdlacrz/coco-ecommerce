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
		primary: 'bg-accent text-ink hover:bg-accent-hover disabled:hover:bg-accent',
		secondary: 'bg-ink text-white hover:bg-ink-hover disabled:hover:bg-ink',
		text: 'bg-transparent text-ink hover:underline disabled:hover:no-underline'
	}[variant];
</script>

<!-- rounded-xl: mismo radio que los CTA principales de producto y checkout
	 ("Agregar al carrito", "Pagar ahora"). Antes este componente usaba
	 rounded-lg y los CTA sueltos rounded-xl, así que dos botones con el mismo
	 peso jerárquico se veían distintos según qué pantalla los renderizaba. -->
<button
	{type}
	{onclick}
	disabled={disabled || loading}
	class="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-display font-semibold transition-colors active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 {variantClass} {className}"
>
	{#if loading}
		<span
			class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
			aria-hidden="true"
		></span>
	{/if}
	{@render children()}
</button>
