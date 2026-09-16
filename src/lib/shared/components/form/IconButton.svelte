<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string; // obligatorio: un botón sin texto necesita nombre accesible
		onclick?: () => void;
		href?: string; // si se pasa, se renderiza como enlace en vez de botón
		size?: 'sm' | 'md';
		disabled?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		label,
		onclick,
		href,
		size = 'md',
		disabled = false,
		class: className = '',
		children
	}: Props = $props();

	const sizeClass = { sm: 'h-9 w-9', md: 'h-10 w-10' }[size];

	// Un solo estilo para todos los botones circulares de ícono (flechas de
	// carrusel, volver arriba, etc.). Antes había cuatro implementaciones con
	// cuatro grises de borde distintos (#262635, #c0c0c0, #c8c8c8, #484848).
	const base =
		'inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-white text-muted shadow-sm transition-all hover:border-ink hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-white disabled:hover:text-muted';
</script>

{#if href}
	<a {href} aria-label={label} class="{base} {sizeClass} {className}">
		{@render children()}
	</a>
{:else}
	<button type="button" {onclick} {disabled} aria-label={label} class="{base} {sizeClass} {className}">
		{@render children()}
	</button>
{/if}
