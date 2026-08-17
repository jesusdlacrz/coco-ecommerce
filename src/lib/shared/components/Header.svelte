<script lang="ts">
	import ShoppingCart from '$lib/shared/icons/ShoppingCart.svelte';
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';
	import Logo from '$lib/shared/icons/Logo.svelte';
	import { activeCategory, categoryColors, type Category } from '$lib/shared/stores/categoryStore';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';

	interface Props {
		cartItemCount: number;
		onCartClick: () => void;
		onAccountClick?: () => void;
		useDynamicColors?: boolean;
		backgroundColor?: string;
	}

	let {
		cartItemCount,
		onCartClick,
		onAccountClick,
		useDynamicColors = false,
		backgroundColor = ''
	}: Props = $props();

	const currentCategory = $derived(useDynamicColors ? $activeCategory : 'women');

	const colors = $derived(
		useDynamicColors
			? categoryColors[currentCategory]
			: {
					primary: 'bg-black',
					primaryHover: 'hover:bg-gray-800',
					border: 'border-transparent',
					text: 'text-gray-600'
				}
	);

	const store = $derived(page.data.storefront ?? HOUSE_STORE);

	// Mostrar el botón "Productos" solo en páginas de detalle de producto
	const isProductDetail = $derived(
		page.url.pathname.startsWith(`${store.basePath}/productos/`) &&
			page.url.pathname !== `${store.basePath}/productos`
	);

	const navigationButtons = $derived([
		{
			label: 'Inicio',
			href: store.basePath || '/'
		},
		{
			label: 'Tienda',
			href: useDynamicColors
				? `${store.basePath}/productos?category=${$activeCategory}`
				: `${store.basePath}/productos?category=women`
		},
		// Condicionalmente agregar "Productos"
		...(isProductDetail
			? [{ label: 'Productos', href: `${store.basePath}/productos?category=${$activeCategory}` }]
			: [])
	]);
</script>

<header class="{backgroundColor} transition-colors duration-700">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-20 items-center justify-between text-[#484848]">
			<div class="flex items-center space-x-4">
				<TransitionLink
					href={store.basePath || '/'}
					class="cursor-pointer transition-all hover:opacity-80"
				>
					{#if store.kind === 'vendor'}
						<span class="font-['Volkhov',serif] text-xl font-bold text-[#262635]">{store.name}</span
						>
					{:else}
						<Logo />
					{/if}
				</TransitionLink>
			</div>
			<div class="flex items-center space-x-12">
				{#each navigationButtons as button (button.label)}
					<TransitionLink
						href={button.href}
						class="cursor-pointer px-1 text-sm font-medium transition-all duration-200 {isProductDetail &&
						button.label === 'Productos'
							? 'border-b-2 border-black text-gray-900'
							: useDynamicColors && button.label === 'Tienda'
								? `border-b-2 ${colors.border} ${colors.text} hover:opacity-80`
								: 'border-b-2 border-transparent text-gray-600 hover:text-gray-800'}"
						style="font-family: 'Poppins', sans-serif;"
					>
						{button.label}
					</TransitionLink>
				{/each}

				<div class="relative">
					<button
						onclick={onCartClick}
						class="flex cursor-pointer items-center space-x-2 rounded-lg p-2.5 transition-colors {colors.primary} {colors.primaryHover}"
					>
						<ShoppingCart size={20} class="text-white" />
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
