<script lang="ts">
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import {
		cartItems,
		cartTotal,
		canProceedToPayment,
		missingUnitsForPayment
	} from '$lib/cart/stores/cartStore';
	import { formatPrice, SHIPPING_COST } from '$lib/shared/utils/price';
	import ChevronDown from '$lib/shared/icons/ChevronDown.svelte';
	import Lock from '$lib/shared/icons/Lock.svelte';
	import { COLOMBIA_DEPARTMENTS } from '$lib/shared/utils/colombiaDepartments';
	import Select from '$lib/shared/components/form/Select.svelte';
	import { HOUSE_STORE } from '$lib/storefront/model';
	import Button from '$lib/shared/components/form/Button.svelte';
	import EmptyState from '$lib/shared/components/EmptyState.svelte';
	import { productHrefForCartItem } from '$lib/cart/utils/productHref';
	import { formatSize } from '$lib/shared/model/sizes';
	import toast from 'svelte-5-french-toast';

	const PAYMENT_METHODS = ['Tarjeta', 'PSE', 'Nequi'];

	const DWELLING_OPTIONS = [
		{ value: 'Casa', label: 'Casa' },
		{ value: 'Apartamento', label: 'Apartamento' },
		{ value: 'Otro', label: 'Otro' }
	];

	const DEPARTMENT_OPTIONS = COLOMBIA_DEPARTMENTS.map((d) => ({ value: d.code, label: d.name }));

	// Aspecto único de los campos del checkout. Antes esta cadena estaba escrita
	// a mano en cada uno de ellos, y sin radio: los únicos controles cuadrados
	// del sitio.
	const FIELD =
		'w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink transition-colors outline-none placeholder:text-muted-soft focus:border-ink focus:ring-2 focus:ring-accent/30';

	// En móvil el resumen ocupaba una pantalla entera antes de poder escribir
	// nada. Se pliega, dejando el total siempre a la vista.
	let summaryOpen = $state(false);

	const WOMPI_CHECKOUT_URL = 'https://checkout.wompi.co/p/';

	// Página completa en vez de widget embebido: Wompi (vía CloudFront) rechaza
	// con 403 cualquier `redirect-url` que apunte a localhost — es una
	// protección anti-open-redirect, confirmado probando la misma URL con y sin
	// ese parámetro. En local simplemente se omite: Wompi muestra su propia
	// pantalla de confirmación en vez de devolver al carrito. El webhook sigue
	// siendo la fuente de verdad para crear el pedido en cualquier caso.
	function buildWompiCheckoutUrl(params: {
		publicKey: string;
		currency: string;
		amountInCents: number;
		reference: string;
		signature: string;
		redirectUrl?: string;
	}): string {
		const query = new SvelteURLSearchParams({
			'public-key': params.publicKey,
			currency: params.currency,
			'amount-in-cents': String(params.amountInCents),
			reference: params.reference,
			'signature:integrity': params.signature,
			'customer-data:email': email,
			'customer-data:full-name': `${firstName} ${lastName}`,
			'customer-data:phone-number': phone,
			'customer-data:phone-number-prefix': '+57'
		});
		if (params.redirectUrl) query.set('redirect-url', params.redirectUrl);
		return `${WOMPI_CHECKOUT_URL}?${query.toString()}`;
	}

	// Wompi rechaza redirect-url apuntando a localhost/127.0.0.1 (ver arriba) —
	// solo se manda cuando corremos en un dominio real (túnel o producción).
	function isLocalHost(hostname: string): boolean {
		return hostname === 'localhost' || hostname === '127.0.0.1';
	}

	// Único destino de envío por ahora — se manda tal cual a WooCommerce.
	const COUNTRY = 'CO';

	let email = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');
	let address = $state('');
	let addressComplement = $state('');
	let dwellingType = $state('');
	let city = $state('');
	let department = $state('');
	let postalCode = $state('');
	let isSubmitting = $state(false);

	const store = $derived(page.data.storefront ?? HOUSE_STORE);
	const cartList = $derived($cartItems ?? []);
	const subtotal = $derived($cartTotal ?? 0);
	const shipping = $derived(cartList.length > 0 ? SHIPPING_COST : 0);
	const total = $derived(subtotal + shipping);

	function hasValidContactInfo(): boolean {
		return Boolean(
			email.trim() &&
				firstName.trim() &&
				lastName.trim() &&
				phone.trim() &&
				address.trim() &&
				city.trim() &&
				department.trim() &&
				dwellingType.trim()
		);
	}

	async function handlePay() {
		if (cartList.length === 0) return;
		if (!hasValidContactInfo()) {
			toast.error('Completa tus datos de contacto y envío');
			return;
		}
		if (!$canProceedToPayment) {
			toast.error(`Agrega ${$missingUnitsForPayment} unidades más para continuar`);
			return;
		}

		isSubmitting = true;
		try {
			const res = await fetch('/api/checkout/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: cartList,
					customer: {
						firstName,
						lastName,
						email,
						phone,
						address,
						addressComplement,
						dwellingType,
						city,
						state: department,
						postalCode,
						country: COUNTRY
					},
					vendorSlug: store.slug
				})
			});

			if (!res.ok) {
				const detail = await res.json().catch(() => null);
				toast.error(detail?.message ?? 'No se pudo iniciar el pago');
				return;
			}

			const { reference, signature, amountInCents, currency, publicKey } = await res.json();
			const redirectUrl = isLocalHost(location.hostname)
				? undefined
				: `${location.origin}${store.basePath}/carrito/confirmacion?reference=${reference}`;

			location.href = buildWompiCheckoutUrl({
				publicKey,
				currency,
				amountInCents,
				reference,
				signature,
				redirectUrl
			});
		} catch {
			toast.error('No se pudo iniciar el pago. Intenta de nuevo.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Pago - {store.name}</title>
</svelte:head>

<div class="min-h-screen pt-2 pb-16">
	<div class="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
		<h1 class="text-center font-display text-3xl font-bold text-ink sm:text-4xl">
			Pago
		</h1>
	</div>

	<div class="mt-8 border-t border-line-soft">
		<div class="mx-auto grid max-w-[1200px] px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
			<section
				class="order-2 py-8 lg:order-1 lg:border-r lg:border-line-soft lg:py-10 lg:pr-12"
			>
				<div class="space-y-8">
					<div>
						<h2 class="mb-5 font-display text-2xl font-bold text-ink">Contacto</h2>
						<label class="block">
							<span class="mb-2 block text-sm text-muted-soft">Correo electrónico</span>
							<input
								bind:value={email}
								class={FIELD}
								placeholder="Correo electrónico"
							/>
						</label>
					</div>

					<div>
						<h2 class="mb-5 font-display text-2xl font-bold text-ink">Envío</h2>
						<p class="mb-4 text-sm text-muted-soft">
							Por ahora solo hacemos envíos dentro de Colombia.
						</p>

						<div class="grid gap-4 sm:grid-cols-2">
							<label class="block">
								<span class="mb-2 block text-sm text-muted-soft">Nombre</span>
								<input
									bind:value={firstName}
									class={FIELD}
									placeholder="Nombre"
								/>
							</label>

							<label class="block">
								<span class="mb-2 block text-sm text-muted-soft">Apellido</span>
								<input
									bind:value={lastName}
									class={FIELD}
									placeholder="Apellido"
								/>
							</label>
						</div>

						<label class="mt-4 block">
							<span class="mb-2 block text-sm text-muted-soft">Teléfono</span>
							<input
								bind:value={phone}
								type="tel"
								class={FIELD}
								placeholder="Ej: 300 123 4567"
							/>
						</label>

						<label class="mt-4 block">
							<span class="mb-2 block text-sm text-muted-soft">Dirección</span>
							<input
								bind:value={address}
								class={FIELD}
								placeholder="Ej: Calle 45 # 20-30"
							/>
						</label>

						<label class="mt-4 block">
							<span class="mb-2 block text-sm text-muted-soft"
								>Complemento (apto, torre, interior, bloque)</span
							>
							<input
								bind:value={addressComplement}
								class={FIELD}
								placeholder="Ej: Apto 302, Torre 4, Conjunto Los Robles"
							/>
						</label>

						<div class="mt-4 grid gap-4 sm:grid-cols-2">
							<label class="block">
								<span class="mb-2 block text-sm text-muted-soft">Tipo de vivienda</span>
								<Select
									id="tipo-vivienda"
									bind:value={dwellingType}
									options={DWELLING_OPTIONS}
									class={FIELD}
								/>
							</label>

							<label class="block">
								<span class="mb-2 block text-sm text-muted-soft">Ciudad</span>
								<input
									bind:value={city}
									class={FIELD}
									placeholder="Ciudad"
								/>
							</label>
						</div>

						<div class="mt-4 grid gap-4 sm:grid-cols-2">
							<label class="block">
								<span class="mb-2 block text-sm text-muted-soft">Departamento</span>
								<Select
									id="departamento"
									bind:value={department}
									options={DEPARTMENT_OPTIONS}
									class={FIELD}
								/>
							</label>

							<label class="block">
								<span class="mb-2 block text-sm text-muted-soft">Código Postal (opcional)</span>
								<input
									bind:value={postalCode}
									class={FIELD}
									placeholder="Código Postal"
								/>
							</label>
						</div>
					</div>

					<div class="pt-2">
						<h2
							class="mb-5 font-display text-2xl font-bold tracking-tight text-ink"
						>
							Método de pago
						</h2>

						<div class="rounded-2xl border border-line-soft bg-white p-5">
							<div class="flex flex-wrap gap-2">
								{#each PAYMENT_METHODS as method (method)}
									<span
										class="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink"
									>
										{method}
									</span>
								{/each}
							</div>
							<div class="mt-3 flex items-center gap-2 text-xs text-muted-soft">
								<Lock size={14} class="flex-shrink-0" />
								<span
									>Pago seguro procesado por <strong>Wompi</strong> — nunca vemos tu tarjeta.</span
								>
							</div>
						</div>

						{#if !$canProceedToPayment}
							<p class="mt-3 text-sm text-[#b45309]">
								Agrega {$missingUnitsForPayment} unidades más para continuar con el pago.
							</p>
						{/if}
					</div>

					<Button
						variant="secondary"
						onclick={handlePay}
						loading={isSubmitting}
						disabled={cartList.length === 0 || !$canProceedToPayment}
						class="mt-8 w-full"
					>
						{isSubmitting ? 'Procesando...' : 'Pagar ahora'}
					</Button>
				</div>
			</section>

			<aside
				class="order-1 mb-6 overflow-hidden rounded-2xl bg-[#FCA1201C] lg:order-2 lg:mb-0 lg:rounded-none"
			>
				<!-- Barra plegable: solo móvil. El total queda siempre visible, que es
				     el dato que da confianza; el detalle se abre si se quiere. -->
				<button
					type="button"
					onclick={() => (summaryOpen = !summaryOpen)}
					aria-expanded={summaryOpen}
					class="flex w-full items-center justify-between gap-4 px-5 py-4 lg:hidden"
				>
					<span class="flex items-center gap-1.5 font-poppins text-sm text-ink">
						{summaryOpen ? 'Ocultar' : 'Ver'} resumen del pedido
						<ChevronDown
							class="h-4 w-4 transition-transform {summaryOpen ? 'rotate-180' : ''}"
						/>
					</span>
					<span class="font-display text-lg font-semibold tabular-nums text-ink">
						{formatPrice(total)}
					</span>
				</button>

				<div class="{summaryOpen ? 'block' : 'hidden'} px-5 pb-6 lg:block lg:p-10">
					{#if cartList.length === 0}
						<EmptyState
							title="Tu carrito está vacío"
							description="Agrega productos para continuar con el pago."
							actionLabel="Ver catálogo"
							actionHref="{store.basePath}/productos"
						/>
					{:else}
						<ul class="space-y-5">
							{#each cartList as item (item.id)}
								{@const href = productHrefForCartItem(item)}
								<li
									class="flex items-start gap-4 border-b border-[#d3c9b8] pb-4 last:border-b-0 last:pb-0"
								>
									<a {href} tabindex="-1" aria-hidden="true" class="relative aspect-[3/4] w-20 flex-shrink-0">
										<img
											src={item.image}
											alt=""
											class="h-full w-full rounded-lg bg-[#ece4d6] object-cover transition-transform duration-300 hover:scale-105"
										/>
										<span
											class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white"
										>
											{item.quantity}
										</span>
									</a>

									<div class="flex w-full items-start justify-between gap-4">
										<div>
											<a
												{href}
												class="font-display text-lg font-semibold text-ink underline-offset-2 hover:underline"
											>
												{item.name}
											</a>
											<p class="mt-1 text-sm text-muted-soft">
												{item.color ?? 'General'}{item.size ? ` / ${formatSize(item.size)}` : ''}
											</p>
										</div>
										<p class="text-right text-base font-medium tabular-nums text-ink">
											{formatPrice(item.price * item.quantity)}
										</p>
									</div>
								</li>
							{/each}
						</ul>
					{/if}

					<div class="mt-8 space-y-4 text-muted">
						<div class="flex items-center justify-between text-base">
							<span>Subtotal</span>
							<span class="tabular-nums">{formatPrice(subtotal)}</span>
						</div>
						<div class="flex items-center justify-between text-base">
							<span>Envío</span>
							<span>{shipping > 0 ? formatPrice(shipping) : 'Por cobrar'}</span>
						</div>
						{#if shipping === 0}
							<p class="text-sm text-muted-soft">
								El flete se paga al recibir el pedido, directamente a la transportadora.
							</p>
						{/if}
						<div
							class="flex items-center justify-between border-t border-[#d3c9b8] pt-4 text-lg font-semibold text-ink"
						>
							<span>Total</span>
							<span class="tabular-nums">{formatPrice(total)}</span>
						</div>
					</div>
				</div>
			</aside>
		</div>
	</div>
</div>
