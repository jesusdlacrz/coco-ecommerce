<script lang="ts">
	import Logo from '$lib/shared/icons/Logo.svelte';
	import mujer from '$lib/assets/faqs/mujer.webp';

	interface Props {
		children?: import('svelte').Snippet;
	}
	const { children }: Props = $props();
</script>

<div class="bg-graybrand relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
	<div class="relative z-10 w-full max-w-md">
		<a href="/" class="mb-8 flex justify-center" aria-label="Ir a Coco's">
			<Logo />
		</a>
		{@render children?.()}
	</div>

	<img
		src={mujer}
		alt=""
		class="pointer-events-none fixed bottom-0 left-0 hidden w-32 sm:block md:w-48 lg:w-60 xl:w-72"
	/>
</div>
