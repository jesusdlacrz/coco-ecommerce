<script lang="ts">
	import type { Storefront } from '$lib/storefront/model';
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';

	interface Props {
		store: Storefront;
	}

	let { store }: Props = $props();
</script>

<section class="relative overflow-hidden bg-gradient-to-t from-[#FCA12054] to-white">
	{#if store.coverImageUrl}
		<div class="absolute inset-0">
			<img src={store.coverImageUrl} alt="" class="h-full w-full object-cover opacity-25" />
		</div>
	{/if}

	<div class="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
		<h1 class="font-['Volkhov',serif] text-4xl font-bold text-[#262635] sm:text-5xl">
			{store.name}
		</h1>
		{#if store.bio}
			<p class="mx-auto mt-5 max-w-xl font-['Jost',sans-serif] leading-relaxed text-[#484848]">
				{store.bio}
			</p>
		{/if}
		<TransitionLink
			href="{store.basePath}/productos"
			class="mt-8 inline-block rounded-xl bg-[#262635] px-10 py-4 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#3a3a4d]"
		>
			Ver catálogo
		</TransitionLink>
	</div>
</section>
