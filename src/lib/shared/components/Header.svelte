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
					primary: 'bg-ink',
					primaryHover: 'hover:bg-ink-hover',
					border: 'border-transparent',
					text: 'text-muted'
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

	// Versalitas espaciadas: es el recurso tipográfico que separa una tienda de
	// autor de un marketplace. Se repite en escritorio y en el panel móvil.
	const NAV_LINK = 'font-poppins text-[11px] uppercase tracking-[0.18em] transition-colors';
</script>

<!-- Retícula de tres columnas con las laterales del mismo ancho (`1fr`): el
     logo queda centrado respecto a la página, no respecto al espacio que dejan
     los enlaces. La línea inferior cierra el header como una franja propia, de
     modo que el título de la página siguiente no se lea como parte de él. -->
<header class="{backgroundColor} border-b border-line-soft transition-colors duration-700">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4 lg:h-24">
			<!-- Izquierda: hamburguesa en móvil, navegación en escritorio -->
			<div class="flex items-center justify-start">
				<button
					onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
					class="-ml-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 md:hidden"
					aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
					aria-expanded={isMobileMenuOpen}
				>
					{#if isMobileMenuOpen}
						<X size={22} />
					{:else}
						<Menu size={22} />
					{/if}
				</button>

				<nav class="hidden items-center gap-8 md:flex lg:gap-10" aria-label="Principal">
					{#each navigationButtons as button (button.label)}
						<a
							href={button.href}
							class="{NAV_LINK} cursor-pointer border-b pb-1 {isProductDetail &&
							button.label === 'Productos'
								? 'border-ink text-ink'
								: useDynamicColors && button.label === 'Tienda'
									? `${colors.border} ${colors.text} hover:opacity-70`
									: 'border-transparent text-muted hover:border-ink/30 hover:text-ink'}"
						>
							{button.label}
						</a>
					{/each}
				</nav>
			</div>

			<!-- Centro: la marca -->
			<a
				href={store.basePath || '/'}
				class="cursor-pointer justify-self-center transition-opacity hover:opacity-70"
				aria-label="Ir al inicio"
			>
				{#if store.kind === 'vendor'}
					<span class="font-display text-xl tracking-wide text-ink lg:text-2xl">{store.name}</span>
				{:else}
					<Logo class="h-7 w-auto lg:h-9" />
				{/if}
			</a>

			<!-- Derecha: acción secundaria y carrito -->
			<div class="flex items-center justify-end gap-5">
				{#if store.kind === 'house'}
					<a
						href="/vendedores/registro"
						class="{NAV_LINK} hidden cursor-pointer border-b border-ink/30 pb-1 text-ink hover:border-ink lg:inline-block"
					>
						Vende con nosotros
					</a>
				{/if}

				<div class="relative">
					<button
						onclick={onCartClick}
						class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors {colors.primary} {colors.primaryHover}"
						aria-label="Abrir carrito"
					>
						<ShoppingCart size={19} class="text-white" />
					</button>
					{#if cartItemCount > 0}
						<!-- Contador en el color de acento de la marca: el rojo con latido
						     era una alerta, y aquí no hay nada que alertar. -->
						<span
							class="pointer-events-none absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-poppins text-[11px] font-semibold text-ink tabular-nums"
						>
							{cartItemCount}
						</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Panel del menú hamburguesa: solo móvil, debajo de la barra -->
		{#if isMobileMenuOpen}
			<div
				transition:slide={{ duration: 200 }}
				class="flex flex-col border-t border-line-soft py-2 md:hidden"
			>
				{#each navigationButtons as button (button.label)}
					<a
						href={button.href}
						class="{NAV_LINK} rounded-lg px-2 py-3.5 hover:bg-ink/5 {isProductDetail &&
						button.label === 'Productos'
							? 'text-ink'
							: 'text-muted'}"
					>
						{button.label}
					</a>
				{/each}

				{#if store.kind === 'house'}
					<a
						href="/vendedores/registro"
						class="{NAV_LINK} mt-2 rounded-full border border-ink px-4 py-3 text-center text-ink hover:bg-ink hover:text-white"
					>
						Vende con nosotros
					</a>
				{/if}
			</div>
		{/if}
	</div>
</header>
