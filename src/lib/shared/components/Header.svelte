<script lang="ts">
	import ShoppingCart from '$lib/shared/icons/ShoppingCart.svelte';
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';
	import Logo from '$lib/shared/icons/Logo.svelte';
	import { activeCategory, categoryColors, type Category } from '$lib/shared/stores/categoryStore';

	interface Props {
		cartItemCount: number;
		onCartClick: () => void;
		onAccountClick?: () => void;
		currentCategory?: Category;
		useDynamicColors?: boolean;
	}

	let { cartItemCount, onCartClick, onAccountClick, currentCategory = 'men', useDynamicColors = false }: Props = $props();

	// Use current category or fall back to store, but only if dynamic colors are enabled
	const category = $derived(useDynamicColors ? currentCategory : 'men');
	const colors = $derived(useDynamicColors ? categoryColors[category] : {
		primary: 'bg-black',
		primaryHover: 'hover:bg-gray-800',
		text: 'text-gray-600'
	});

	const navigationButtons = $derived([
		{
			label: 'Home',
			href: '/'
		},
		{
			label: 'Shop',
			href: useDynamicColors && currentCategory ? `/productos?category=${currentCategory}` : '/productos'
		},
	]);
</script>

<header>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-20 items-center justify-between text-[#484848]">
			<div class="flex items-center space-x-4">
				<TransitionLink
					href="/"
					class="cursor-pointer transition-all hover:opacity-80"
				>
					<Logo />
				</TransitionLink>
			</div>
			<div class="flex items-center space-x-12">
				{#each navigationButtons as button (button.label)}
					<TransitionLink
						href={button.href}
						class="cursor-pointer text-sm transition-colors {useDynamicColors && button.label === 'Shop' 
							? `${colors.text} hover:opacity-80` 
							: 'text-gray-600 hover:text-gray-800'}"
					>
						{button.label}
					</TransitionLink>
				{/each}

				<div class="relative">
					<button
						onclick={onCartClick}
						class="flex cursor-pointer items-center space-x-2 rounded-lg p-2.5 transition-colors {colors.primary} {colors.primaryHover}"
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
