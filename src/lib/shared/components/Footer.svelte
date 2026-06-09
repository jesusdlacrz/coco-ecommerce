<script lang="ts">
	import { onMount } from 'svelte';
	import TransitionLink from './TransitionLink.svelte';

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
				<TransitionLink href="/contacto" class="text-[#484848] transition-colors hover:text-[#262635]">
					Contacto
				</TransitionLink>
				<TransitionLink href="/faqs" class="text-[#484848] transition-colors hover:text-[#262635]">
					FAQ'S
				</TransitionLink>
			</div>
			<p class="text-sm text-[#767676]">Copyright © 2026. All Rights Reserved.</p>
		</div>

		<!-- Scroll to top button (right-aligned, conditional) -->
		<button
			onclick={scrollToTop}
			aria-label="Volver arriba"
			class="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#484848] text-[#484848] transition-all duration-300 hover:bg-[#262635] hover:text-white
				{showScrollTop ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
			</svg>
		</button>
	</div>
</footer>
