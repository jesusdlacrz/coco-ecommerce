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
	import { HOUSE_STORE } from '$lib/storefront/model';
	import Button from '$lib/shared/components/form/Button.svelte';
	import EmptyState from '$lib/shared/components/EmptyState.svelte';
	import toast from 'svelte-5-french-toast';

	const PAYMENT_METHODS = ['Tarjeta', 'PSE', 'Nequi'];

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
		<h1 class="text-center font-display text-3xl font-bold text-black sm:text-4xl">
			Pago
		</h1>
	</div>

	<div class="mt-8 border-t border-[#d9d9d6]">
		<div class="mx-auto grid max-w-[1200px] px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
			<section
				class="order-2 rounded-none bg-transparent px-12 py-10 lg:order-1 lg:border-r lg:border-[#d9d9d6]"
			>
				<div class="space-y-8">
					<div>
						<h2 class="mb-5 font-display text-2xl font-bold text-black">Contacto</h2>
						<label class="block">
							<span class="mb-2 block text-sm text-muted-soft">Correo electrónico</span>
							<input
								bind:value={email}
								class="w-full border border-line bg-white px-4 py-3 text-base text-ink transition-all outline-none placeholder:text-muted-soft focus:border-ink"
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
									class="w-full border border-line bg-white px-4 py-3 text-base text-ink transition-all outline-none placeholder:text-muted-soft focus:border-ink"
									placeholder="Nombre"
								/>
							</label>

							<label class="block">
								<span class="mb-2 block text-sm text-muted-soft">Apellido</span>
								<input
									bind:value={lastName}
									class="w-full border border-line bg-white px-4 py-3 text-base text-ink transition-all outline-none placeholder:text-muted-soft focus:border-ink"
									placeholder="Apellido"
								/>
							</label>
						</div>

						<label class="mt-4 block">
							<span class="mb-2 block text-sm text-muted-soft">Teléfono</span>
							<input
								bind:value={phone}
								type="tel"
								class="w-full border border-line bg-white px-4 py-3 text-base text-ink transition-all outline-none placeholder:text-muted-soft focus:border-ink"
								placeholder="Ej: 300 123 4567"
							/>
						</label>

						<label class="mt-4 block">
							<span class="mb-2 block text-sm text-muted-soft">Dirección</span>
							<input
								bind:value={address}
								class="w-full border border-line bg-white px-4 py-3 text-base text-ink transition-all outline-none placeholder:text-muted-soft focus:border-ink"
								placeholder="Ej: Calle 45 # 20-30"
							/>
						</label>

						<label class="mt-4 block">
							<span class="mb-2 block text-sm text-muted-soft"
								>Complemento (apto, torre, interior, bloque)</span
							>
							<input
								bind:value={addressComplement}
								class="w-full border border-line bg-white px-4 py-3 text-base text-ink transition-all outline-none placeholder:text-muted-soft focus:border-ink"
								placeholder="Ej: Apto 302, Torre 4, Conjunto Los Robles"
							/>
						</label>

						<div class="mt-4 grid gap-4 sm:grid-cols-2">
							<label class="block">
								<span class="mb-2 block text-sm text-muted-soft">Tipo de vivienda</span>
								<div class="relative">
									<select
										bind:value={dwellingType}
										class="w-full appearance-none border border-line bg-white px-4 py-3 pr-10 text-base text-ink transition-all outline-none focus:border-ink"
									>
										<option value="">Selecciona una opción</option>
										<option value="Casa">Casa</option>
										<option value="Apartamento">Apartamento</option>
										<option value="Otro">Otro</option>
									</select>
									<ChevronDown
										class="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted-soft"
									/>
								</div>
							</label>

							<label class="block">
								<span class="mb-2 block text-sm text-muted-soft">Ciudad</span>
								<input
									bind:value={city}
									class="w-full border border-line bg-white px-4 py-3 text-base text-ink transition-all outline-none placeholder:text-muted-soft focus:border-ink"
									placeholder="Ciudad"
								/>
							</label>
						</div>

						<div class="mt-4 grid gap-4 sm:grid-cols-2">
							<label class="block">
								<span class="mb-2 block text-sm text-muted-soft">Departamento</span>
								<div class="relative">
									<select
										bind:value={department}
										class="w-full appearance-none border border-line bg-white px-4 py-3 pr-10 text-base text-ink transition-all outline-none focus:border-ink"
									>
										<option value="">Selecciona una opción</option>
										{#each COLOMBIA_DEPARTMENTS as department (department.code)}
											<option value={department.code}>{department.name}</option>
										{/each}
									</select>
									<ChevronDown
										class="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted-soft"
									/>
								</div>
							</label>

							<label class="block">
								<span class="mb-2 block text-sm text-muted-soft">Código Postal (opcional)</span>
								<input
									bind:value={postalCode}
									class="w-full border border-line bg-white px-4 py-3 text-base text-ink transition-all outline-none placeholder:text-muted-soft focus:border-ink"
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

						<div class="rounded-2xl border border-line bg-white p-4">
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

			<aside class="order-1 rounded-none bg-[#FCA1201C] p-4 sm:p-6 lg:order-2 lg:p-10">
				{#if cartList.length === 0}
					<EmptyState
						title="Tu carrito está vacío"
						description="Agrega productos para continuar con el pago."
						actionLabel="Ver catálogo"
						actionHref="{store.basePath}/productos"
					/>
				{:else}
					<div class="space-y-5">
						{#each cartList as item (item.id)}
							<div
								class="flex items-start gap-4 border-b border-[#d3c9b8] pb-4 last:border-b-0 last:pb-0"
							>
								<div class="relative h-24 w-20 flex-shrink-0 bg-[#ece4d6]">
									<img
										src={item.image}
										alt={item.name}
										class="h-full w-full rounded-md object-cover"
									/>
									<span
										class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
									>
										{item.quantity}
									</span>
								</div>

								<div class="flex w-full items-start justify-between gap-4">
									<div>
										<p class="font-display text-lg font-semibold text-ink">
											{item.name}
										</p>
										<p class="mt-1 text-sm text-muted-soft">
											{item.color ?? 'General'}{item.size ? ` / ${item.size}` : ''}
										</p>
									</div>
									<p class="text-right text-base font-medium text-ink">
										{formatPrice(item.price * item.quantity)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<div class="mt-8 space-y-4 text-[#454545]">
					<div class="flex items-center justify-between text-base">
						<span>Subtotal</span>
						<span>{formatPrice(subtotal)}</span>
					</div>
					<div class="flex items-center justify-between text-base">
						<span>Envío</span>
						<span>{formatPrice(shipping)}</span>
					</div>
					<div
						class="flex items-center justify-between border-t border-[#d3c9b8] pt-4 text-lg font-semibold text-ink"
					>
						<span>Total</span>
						<span>{formatPrice(total)}</span>
					</div>
				</div>
			</aside>
		</div>
	</div>
</div>
