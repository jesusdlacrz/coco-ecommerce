<script lang="ts">
	import ProductCard from '$lib/products/components/ProductCard.svelte';
	import ProductFilters from '$lib/products/components/ProductFilters.svelte';
	import SimpleCategoryTabs from '$lib/products/components/CatalogCategoryTabs.svelte';
	import { goto, replaceState } from '$app/navigation';
	import { untrack } from 'svelte';

	import type { Product } from '$lib/shared/model/products';
	import { activeCategory, type Category } from '$lib/shared/stores/categoryStore';
	import { page } from '$app/state';
	import { HOUSE_STORE } from '$lib/storefront/model';
	import EmptyState from '$lib/shared/components/EmptyState.svelte';

	interface Props {
		products: Product[];
	}

	// =================== PROPS ===================
	let { products }: Props = $props();

	const store = $derived(page.data.storefront ?? HOUSE_STORE);

	// =================== STATE ===================
	// Detectar categoría inicial desde el query param antes del primer render para evitar parpadeo.
	const urlCategory = page.url.searchParams.get('category');
	const validCategories: Category[] = ['men', 'women', 'boys', 'girls'];
	const initialCategory: Category =
		urlCategory && validCategories.includes(urlCategory as Category)
			? (urlCategory as Category)
			: 'women'; // Solo default a 'women' si no viene categoría (caso botón Shop)

	// Sincronizar inmediatamente el store global
	activeCategory.set(initialCategory);

	let activeTab = $state<Category>(initialCategory);

	// =================== DERIVED DATA ===================
	const menProducts = $derived(products.filter((p) => p.gender === 'men'));
	const womenProducts = $derived(products.filter((p) => p.gender === 'women'));
	const boysProducts = $derived(products.filter((p) => p.gender === 'boys'));
	const girlsProducts = $derived(products.filter((p) => p.gender === 'girls'));

	const currentProducts = $derived(
		activeTab === 'men'
			? menProducts
			: activeTab === 'women'
				? womenProducts
				: activeTab === 'boys'
					? boysProducts
					: girlsProducts
	);

	// No puede ser un $derived puro: currentProducts lo reinicia al cambiar de
	// categoría, pero ProductFilters también lo sobreescribe vía
	// handleFiltersChange — tiene dos fuentes de escritura. Arranca con el
	// catálogo completo (y no con []) porque en SSR los efectos no corren: con
	// [] el servidor pintaba "Sin resultados" y la grilla solo aparecía al
	// hidratar.
	// eslint-disable-next-line svelte/prefer-writable-derived
	let filteredProducts = $state<Product[]>(
		products.filter((p) => p.gender === initialCategory)
	);

	// =================== PAGINACIÓN ===================
	// Con el inventario de Effi una categoría puede tener cientos de productos:
	// pintarlos todos de una vez hacía la página pesadísima en el celular. La
	// página va en la URL (?pagina=2) para que "atrás" vuelva a la misma.
	const PAGE_SIZE = 24;
	let currentPage = $state(Math.max(1, Number(page.url.searchParams.get('pagina')) || 1));
	const totalPages = $derived(Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE)));
	// Si los filtros dejan menos páginas que la actual, se muestra la última.
	const shownPage = $derived(Math.min(currentPage, totalPages));
	const pageProducts = $derived(
		filteredProducts.slice((shownPage - 1) * PAGE_SIZE, shownPage * PAGE_SIZE)
	);
	const firstShown = $derived(filteredProducts.length ? (shownPage - 1) * PAGE_SIZE + 1 : 0);
	const lastShown = $derived(Math.min(shownPage * PAGE_SIZE, filteredProducts.length));

	/** Números a mostrar: siempre la primera, la última y dos alrededor de la actual. */
	const pageNumbers = $derived.by(() => {
		const pages: (number | '…')[] = [];
		for (let n = 1; n <= totalPages; n++) {
			if (n === 1 || n === totalPages || Math.abs(n - shownPage) <= 1) pages.push(n);
			else if (pages.at(-1) !== '…') pages.push('…');
		}
		return pages;
	});

	let gridTop = $state<HTMLElement>();

	// Solo cambia la URL (enrutado "superficial"): con goto() SvelteKit volvía a
	// cargar todo el catálogo del servidor en cada cambio de página.
	function setPageInUrl(n: number) {
		const url = new URL(window.location.href);
		if (n > 1) url.searchParams.set('pagina', String(n));
		else url.searchParams.delete('pagina');
		replaceState(url, page.state);
	}

	function goToPage(n: number) {
		currentPage = n;
		setPageInUrl(n);
		gridTop?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function resetPage() {
		if (currentPage === 1) return;
		currentPage = 1;
		setPageInUrl(1);
	}

	// =================== LIFECYCLE ===================
	// Initialize filtered products when current products change
	$effect(() => {
		filteredProducts = currentProducts;
	});

	// =================== UI HANDLERS ===================
	function handleTabChange(tab: Category) {
		activeTab = tab;

		// Update global category store
		activeCategory.set(tab);

		// Actualizar la URL con el query parameter (y volver a la página 1)
		currentPage = 1;
		const url = new URL(window.location.href);
		url.searchParams.set('category', tab);
		url.searchParams.delete('pagina');
		goto(url.toString(), { replaceState: true });
	}

	const idsOf = (list: Product[]) => list.map((p) => p.id).join('|');

	function handleFiltersChange(filtered: Product[]) {
		// Los filtros también avisan al montarse con la misma lista: solo un
		// cambio real de resultados vuelve a la página 1 (si no, "atrás" a la
		// página 3 aterrizaría siempre en la 1).
		// `untrack`: esto corre dentro del $effect de ProductFilters; leer el
		// estado de aquí lo volvería dependencia de ese efecto y, al escribirlo,
		// se dispararía a sí mismo sin fin.
		untrack(() => {
			if (idsOf(filtered) !== idsOf(filteredProducts)) resetPage();
		});
		filteredProducts = filtered;
	}
</script>

<svelte:head>
	<title>Productos - {store.name}</title>
	<meta
		name="description"
		content="Catálogo completo de {store.name}: blusas, camisas y conjuntos al por mayor, por talla y color, con envío a toda Colombia."
	/>
</svelte:head>

<div class="min-h-screen">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Category Tabs - Simplified for products page -->
		<SimpleCategoryTabs {activeTab} onTabChange={handleTabChange} />

		<!-- Main Content with Filters -->
		<div class="lg:grid lg:grid-cols-4 lg:gap-8">
			<!-- Filters Sidebar -->
			<div class="lg:col-span-1">
				<div class="sticky top-6">
					<ProductFilters
						products={currentProducts}
						activeCategory={activeTab}
						onFiltersChange={handleFiltersChange}
					/>
				</div>
			</div>

			<!-- Products Grid -->
			<div class="mt-6 scroll-mt-6 lg:col-span-3 lg:mt-0" bind:this={gridTop}>
				<p class="mb-4 font-poppins text-sm text-muted-soft">
					{#if totalPages > 1}
						Mostrando {firstShown}–{lastShown} de {filteredProducts.length} productos
					{:else}
						Mostrando {filteredProducts.length} de {currentProducts.length} productos
					{/if}
				</p>

				<div class="space-y-6">
					<!-- Grid de productos con tarjetas especializadas -->
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each pageProducts as product, i (product.id)}
							<ProductCard {product} currentCategory={activeTab} priority={i < 3} />
						{/each}
					</div>

					{#if totalPages > 1}
						<nav class="flex items-center justify-center gap-1 pt-4" aria-label="Paginación">
							<button
								type="button"
								class="rounded-md px-3 py-2 font-poppins text-sm text-ink transition-colors hover:bg-graybrand/40 disabled:pointer-events-none disabled:opacity-40"
								disabled={shownPage === 1}
								onclick={() => goToPage(shownPage - 1)}
							>
								Anterior
							</button>
							{#each pageNumbers as n, i (i)}
								{#if n === '…'}
									<span class="px-2 text-sm text-muted-soft" aria-hidden="true">…</span>
								{:else}
									<button
										type="button"
										class="h-9 min-w-9 rounded-md px-2 font-poppins text-sm transition-colors {n === shownPage
											? 'bg-ink text-white'
											: 'text-ink hover:bg-graybrand/40'}"
										aria-label="Página {n}"
										aria-current={n === shownPage ? 'page' : undefined}
										onclick={() => goToPage(n)}
									>
										{n}
									</button>
								{/if}
							{/each}
							<button
								type="button"
								class="rounded-md px-3 py-2 font-poppins text-sm text-ink transition-colors hover:bg-graybrand/40 disabled:pointer-events-none disabled:opacity-40"
								disabled={shownPage === totalPages}
								onclick={() => goToPage(shownPage + 1)}
							>
								Siguiente
							</button>
						</nav>
					{/if}

					{#if filteredProducts.length === 0}
						<EmptyState
							size="page"
							title="Sin resultados"
							description="Ningún producto coincide con los filtros seleccionados. Prueba quitando alguno."
						/>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
