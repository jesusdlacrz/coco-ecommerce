<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}
	const { children }: Props = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 py-12">
	<div class="w-full max-w-md">
		<a
			href="/"
			class="mb-8 block text-center font-['Volkhov',serif] text-2xl font-bold text-[#262635]"
		>
			Coco's
		</a>
		{@render children?.()}
	</div>
</div>
