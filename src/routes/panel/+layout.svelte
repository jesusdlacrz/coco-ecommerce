<script lang="ts">
	import { page } from '$app/state';
	import Logo from '$lib/shared/icons/Logo.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}
	const { children }: Props = $props();

	const links = [
		{ href: '/panel', label: 'Inicio' },
		{ href: '/panel/comisiones', label: 'Comisiones' },
		{ href: '/panel/ajustes', label: 'Ajustes' }
	];
</script>

<div class="min-h-screen bg-gradient-to-b from-[#FCA12014] to-[#FAFAFA]">
	<header class="sticky top-0 z-30 border-b border-line-soft bg-white/90 backdrop-blur-sm">
		<div
			class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 overflow-x-auto px-4"
		>
			<a href="/panel" class="flex items-center gap-3" aria-label="Ir al panel">
				<Logo />
				<span class="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink"
					>Panel</span
				>
			</a>
			<nav class="flex items-center gap-6">
				{#each links as link (link.href)}
					<a
						href={link.href}
						aria-current={page.url.pathname === link.href ? 'page' : undefined}
						class="font-body text-sm whitespace-nowrap transition-colors
							{page.url.pathname === link.href
							? 'border-b-2 border-accent text-ink'
							: 'text-muted-soft hover:text-ink'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>
			<div class="flex items-center gap-4">
				<a
					href="/v/{page.data.vendor?.slug}"
					target="_blank"
					rel="noopener"
					class="font-body text-sm whitespace-nowrap text-ink hover:underline"
				>
					Ver mi revista ↗
				</a>
				<form method="POST" action="/vendedores/salir">
					<button
						type="submit"
						class="font-body text-sm font-medium whitespace-nowrap text-muted-soft hover:text-ink"
					>
						Salir
					</button>
				</form>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-8">
		{@render children?.()}
	</main>
</div>
