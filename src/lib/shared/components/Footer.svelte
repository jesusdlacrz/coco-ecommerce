<script lang="ts">
	import { onMount } from 'svelte';
	import TransitionLink from './TransitionLink.svelte';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';

	const store = $derived(page.data.storefront ?? HOUSE_STORE);

	let showScrollTop = $state(false);

	onMount(() => {
		function handleScroll() {
			showScrollTop = window.scrollY > 200;
		}
		handleScroll(); // check initial position (covers mid-page mounts on navigation)
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<footer class="border-t border-black/10 bg-transparent py-12">
	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Centered links + copyright -->
		<div class="flex flex-col items-center gap-4 text-center">
			<div class="flex gap-8">
				<TransitionLink
					href="{store.basePath}/contacto"
					class="text-[#484848] transition-colors hover:text-[#262635]"
				>
					Contacto
				</TransitionLink>
				{#if store.kind === 'house'}
					<TransitionLink
						href="/faqs"
						class="text-[#484848] transition-colors hover:text-[#262635]"
					>
						FAQ'S
					</TransitionLink>
				{/if}
			</div>
			<p class="text-sm text-[#767676]">Copyright © 2026. All Rights Reserved.</p>
			{#if store.kind === 'vendor'}
				<a href="/" class="text-xs text-[#a0a0a0] transition-colors hover:text-[#262635]">
					Con tecnología de Coco's
				</a>
			{/if}
		</div>

		<!-- Scroll to top button (right-aligned, conditional) -->
		<button
			onclick={scrollToTop}
			aria-label="Volver arriba"
			class="absolute top-1/2 right-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#484848] text-[#484848] transition-all duration-300 hover:bg-[#262635] hover:text-white
				{showScrollTop ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5 10l7-7m0 0l7 7m-7-7v18"
				/>
			</svg>
		</button>
	</div>
</footer>
