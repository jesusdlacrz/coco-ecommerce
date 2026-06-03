<script lang="ts">
	import TransitionLink from './TransitionLink.svelte';

	interface Props {
		backgroundColor?: string;
	}

	let { backgroundColor = '' }: Props = $props();
</script>

<footer class="border-t border-[#D5D5D5] {backgroundColor} transition-colors duration-700">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="flex flex-col items-center justify-center text-center text-gray-600">
			<div class="flex gap-4">
				<TransitionLink href="/faqs">FAQS</TransitionLink>
				<TransitionLink href="/contacto">Contacto</TransitionLink>
			</div>
			<p class="text-sm">Copyright © 2025. All Rights Reseved.</p>
		</div>
	</div>
</footer>
