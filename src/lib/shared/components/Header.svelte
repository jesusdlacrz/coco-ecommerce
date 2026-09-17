<script lang="ts">
	import { slide } from 'svelte/transition';
	import ShoppingCart from '$lib/shared/icons/ShoppingCart.svelte';
	import Logo from '$lib/shared/icons/Logo.svelte';
	import Menu from '$lib/shared/icons/Menu.svelte';
	import X from '$lib/shared/icons/X.svelte';
	import { activeCategory, categoryColors } from '$lib/shared/stores/categoryStore';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';

	interface Props {
		cartItemCount: number;
		onCartClick: () => void;
		useDynamicColors?: boolean;
		backgroundColor?: string;
	}

	let {
		cartItemCount,
		onCartClick,
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

	let isMobileMenuOpen = $state(false);

	// Cerrar el menú móvil al navegar a otra ruta, sin tener que enganchar un
	// handler extra en cada enlace.
	let lastPathname = page.url.pathname;
	$effect(() => {
		const pathname = page.url.pathname;
		if (pathname === lastPathname) return;
		lastPathname = pathname;
		isMobileMenuOpen = false;
	});

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
		<div class="flex h-20 items-center justify-between text-muted">
			<div class="flex items-center space-x-4">
				<a
					href={store.basePath || '/'}
					class="cursor-pointer transition-all hover:opacity-80"
				>
					{#if store.kind === 'vendor'}
						<span class="font-display text-xl font-bold text-ink">{store.name}</span
						>
					{:else}
						<Logo />
					{/if}
				</a>
			</div>

			<!-- Navegación + carrito agrupados a la derecha -->
			<div class="flex items-center gap-6 lg:gap-10">
				<!-- Navegación de escritorio: oculta en móvil, el menú hamburguesa la reemplaza ahí -->
				<div class="hidden items-center space-x-8 md:flex lg:space-x-12">
					{#each navigationButtons as button (button.label)}
						<a
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
						</a>
					{/each}

					{#if store.kind === 'house'}
						<a
							href="/vendedores/registro"
							class="cursor-pointer rounded-full border border-ink px-4 py-1.5 text-sm font-medium text-ink transition-all duration-200 hover:bg-ink hover:text-white"
							style="font-family: 'Poppins', sans-serif;"
						>
							Vende con nosotros
						</a>
					{/if}
				</div>

				<!-- Hamburguesa (solo móvil) + carrito, siempre visible en ambos tamaños -->
				<div class="flex items-center space-x-2">
					<button
						onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
						class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-black/5 md:hidden"
						aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
						aria-expanded={isMobileMenuOpen}
					>
						{#if isMobileMenuOpen}
							<X size={22} />
						{:else}
							<Menu size={22} />
						{/if}
					</button>

					<div class="relative">
						<button
							onclick={onCartClick}
						class="flex cursor-pointer items-center space-x-2 rounded-lg p-2.5 transition-colors {colors.primary} {colors.primaryHover}"
						aria-label="Abrir carrito"
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

		<!-- Panel del menú hamburguesa: solo móvil, debajo de la barra -->
		{#if isMobileMenuOpen}
			<div
				transition:slide={{ duration: 200 }}
				class="flex flex-col gap-1 border-t border-line-soft pt-3 pb-4 md:hidden"
			>
				{#each navigationButtons as button (button.label)}
					<a
						href={button.href}
						class="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-black/5 {isProductDetail &&
						button.label === 'Productos'
							? 'text-gray-900'
							: ''}"
						style="font-family: 'Poppins', sans-serif;"
					>
						{button.label}
					</a>
				{/each}

				{#if store.kind === 'house'}
					<a
						href="/vendedores/registro"
						class="mt-1 rounded-lg border border-ink px-3 py-2.5 text-center text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
						style="font-family: 'Poppins', sans-serif;"
					>
						Vende con nosotros
					</a>
				{/if}
			</div>
		{/if}
	</div>
</header>
