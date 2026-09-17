<script lang="ts">
	import type { Storefront } from '$lib/storefront/model';
	import { buttonClass } from '$lib/shared/components/form/buttonStyles';

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
		<h1 class="font-display text-4xl font-bold text-ink sm:text-5xl">
			{store.name}
		</h1>
		{#if store.bio}
			<p class="mx-auto mt-5 max-w-xl font-body leading-relaxed text-muted">
				{store.bio}
			</p>
		{/if}
		<a
			href="{store.basePath}/productos"
			class={buttonClass('secondary', 'md', 'mt-8 shadow-lg')}
		>
			Ver catálogo
		</a>
	</div>
</section>
