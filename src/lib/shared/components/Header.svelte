<script lang="ts">
	import ShoppingCart from '$lib/shared/icons/ShoppingCart.svelte';
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';

	interface Props {
		cartItemCount: number;
		onCartClick: () => void;
		onAccountClick?: () => void;
	}

	let { cartItemCount, onCartClick, onAccountClick }: Props = $props();

	const navigationButtons = [
		{
			label: 'Home',
			href: '/'
		},
		{
			label: 'Productos',
			href: '/productos'
		},
		{
			label: 'Catalogo',
			href: '/productos'
		}
	];
</script>

<header>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-20 items-center justify-between text-[#484848]">
			<div class="flex items-center space-x-4">
				<TransitionLink
					href="/"
					class="cursor-pointer text-2xl transition-colors hover:text-gray-600"
					style="font-family: 'Volkhov', serif;"
				>
					Coco's
				</TransitionLink>
			</div>
			<div class="flex items-center space-x-12">
				{#each navigationButtons as button}
					<TransitionLink
						href={button.href}
						class="cursor-pointer text-sm transition-colors hover:text-gray-600"
					>
						{button.label}
					</TransitionLink>
				{/each}

				<div class="relative">
					<button
						onclick={onCartClick}
						class="flex cursor-pointer items-center space-x-2 rounded-lg bg-black p-2.5 transition-colors hover:bg-gray-800"
					>
						<ShoppingCart size={20} class="text-white"/>
					</button>
					{#if cartItemCount > 0}
						<span
							class="absolute -top-2 -right-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs text-white"
						>
							{cartItemCount}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
</header>
