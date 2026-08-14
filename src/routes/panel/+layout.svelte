<script lang="ts">
	import { page } from '$app/state';

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

<div class="min-h-screen bg-[#FAFAFA]">
	<header class="sticky top-0 z-30 border-b border-black/10 bg-white">
		<div
			class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 overflow-x-auto px-4"
		>
			<div class="flex items-center gap-3">
				<span class="font-['Volkhov',serif] font-bold text-[#262635]">Coco's</span>
				<span class="rounded-full bg-[#262635]/5 px-2 py-0.5 text-xs font-medium text-[#262635]"
					>Panel</span
				>
			</div>
			<nav class="flex items-center gap-6">
				{#each links as link (link.href)}
					<a
						href={link.href}
						aria-current={page.url.pathname === link.href ? 'page' : undefined}
						class="font-['Jost',sans-serif] text-sm whitespace-nowrap transition-colors
							{page.url.pathname === link.href
							? 'border-b-2 border-[#FCA120] text-[#262635]'
							: 'text-[#767676] hover:text-[#262635]'}"
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
					class="font-['Jost',sans-serif] text-sm whitespace-nowrap text-[#262635] hover:underline"
				>
					Ver mi revista ↗
				</a>
				<form method="POST" action="/vendedores/salir">
					<button
						type="submit"
						class="font-['Jost',sans-serif] text-sm font-medium whitespace-nowrap text-[#767676] hover:text-[#262635]"
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
