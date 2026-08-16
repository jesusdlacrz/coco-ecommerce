<script lang="ts">
	import { cartItems, cartTotal } from '$lib/cart/stores/cartStore';
	import { formatPrice } from '$lib/shared/utils/cartUtils';
	import ChevronDown from '$lib/shared/icons/ChevronDown.svelte';

	let email = $state('');
	let country = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let address = $state('');
	let city = $state('');
	let postalCode = $state('');
	let discountCode = $state('');
	let paymentMethod = $state('');
	let saveInfo = $state(false);

	const cartList = $derived($cartItems ?? []);
	const subtotal = $derived($cartTotal ?? 0);
	const shipping = $derived(cartList.length > 0 ? 60 : 0);
	const total = $derived(subtotal + shipping);

	function applyDiscount() {
		if (!discountCode.trim()) return;
		// TODO: validar y aplicar el código contra los cupones de WooCommerce.
	}
</script>

<svelte:head>
	<title>Pago - Coco's</title>
</svelte:head>

<div class="min-h-screen pb-16 pt-2">
	<div class="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
		<h1 class="text-center font-['Volkhov',serif] text-3xl font-bold text-black sm:text-4xl">
			Pago
		</h1>
	</div>

	<div class="mt-8 border-t border-[#d9d9d6]">
		<div class="mx-auto grid max-w-[1200px] px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
			<section class="rounded-none bg-transparent px-12 py-10 lg:border-r lg:border-[#d9d9d6]">
				<div class="space-y-8">
					<div>
						<h2 class="mb-5 font-['Volkhov',serif] text-2xl font-bold text-black">
							Contacto
						</h2>
						<label class="block">
							<span class="mb-2 block text-sm text-[#6b6b6b]">Correo electrónico</span>
							<input
								bind:value={email}
								class="w-full border border-[#d1d1d1] bg-white px-4 py-3 text-base text-[#262635] outline-none transition-all placeholder:text-[#8a8a8a] focus:border-[#262635]"
								placeholder="Correo electrónico"
							/>
						</label>
					</div>

					<div>
						<h2 class="mb-5 font-['Volkhov',serif] text-2xl font-bold text-[#262635]">
							Envío
						</h2>

						<label class="block">
							<span class="mb-2 block text-sm text-[#6b6b6b]">País / Región</span>
							<div class="relative">
								<select
									bind:value={country}
									class="w-full appearance-none border border-[#d1d1d1] bg-white px-4 py-3 pr-10 text-base text-[#262635] outline-none transition-all focus:border-[#262635]"
								>
									<option value="">País / Región</option>
									<option value="colombia">Colombia</option>
									<option value="mexico">México</option>
									<option value="argentina">Argentina</option>
								</select>
								<ChevronDown
									class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6b6b]"
								/>
							</div>
						</label>

						<div class="mt-4 grid gap-4 sm:grid-cols-2">
							<label class="block">
								<span class="mb-2 block text-sm text-[#6b6b6b]">Nombre</span>
								<input
									bind:value={firstName}
									class="w-full border border-[#d1d1d1] bg-white px-4 py-3 text-base text-[#262635] outline-none transition-all placeholder:text-[#8a8a8a] focus:border-[#262635]"
									placeholder="Nombre"
								/>
							</label>

							<label class="block">
								<span class="mb-2 block text-sm text-[#6b6b6b]">Apellido</span>
								<input
									bind:value={lastName}
									class="w-full border border-[#d1d1d1] bg-white px-4 py-3 text-base text-[#262635] outline-none transition-all placeholder:text-[#8a8a8a] focus:border-[#262635]"
									placeholder="Apellido"
								/>
							</label>
						</div>

						<label class="mt-4 block">
							<span class="mb-2 block text-sm text-[#6b6b6b]">Dirección</span>
							<input
								bind:value={address}
								class="w-full border border-[#d1d1d1] bg-white px-4 py-3 text-base text-[#262635] outline-none transition-all placeholder:text-[#8a8a8a] focus:border-[#262635]"
								placeholder="Dirección"
							/>
						</label>

						<div class="mt-4 grid gap-4 sm:grid-cols-2">
							<label class="block">
								<span class="mb-2 block text-sm text-[#6b6b6b]">Ciudad</span>
								<input
									bind:value={city}
									class="w-full border border-[#d1d1d1] bg-white px-4 py-3 text-base text-[#262635] outline-none transition-all placeholder:text-[#8a8a8a] focus:border-[#262635]"
									placeholder="Ciudad"
								/>
							</label>

							<label class="block">
								<span class="mb-2 block text-sm text-[#6b6b6b]">Código Postal</span>
								<input
									bind:value={postalCode}
									class="w-full border border-[#d1d1d1] bg-white px-4 py-3 text-base text-[#262635] outline-none transition-all placeholder:text-[#8a8a8a] focus:border-[#262635]"
									placeholder="Código Postal"
								/>
							</label>
						</div>
					</div>

					<div class="pt-2">
						<h2 class="mb-5 font-['Volkhov',serif] text-2xl font-bold tracking-tight text-[#262635]">
							Método de pago
						</h2>

						<label class="block">
							<span class="mb-2 block text-sm text-[#6b6b6b]">Elige un método de pago</span>
							<div class="relative">
								<select
									bind:value={paymentMethod}
									class="w-full appearance-none border border-[#d1d1d1] bg-white px-4 py-3 pr-10 text-base text-[#262635] outline-none transition-all focus:border-[#262635]"
								>
									<option value="">Elige un método de pago</option>
									<option value="card">Tarjeta de crédito</option>
									<option value="paypal">PayPal</option>
									<option value="bank">Transferencia bancaria</option>
								</select>
								<ChevronDown
									class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6b6b]"
								/>
							</div>
						</label>

						<div class="mt-4 rounded-xl border border-[#d1d1d1] bg-white p-4">
							<div class="space-y-3">
								<div class="h-12 w-full rounded-md border border-[#d1d1d1] bg-white"></div>
								<div class="h-12 w-full rounded-md border border-[#d1d1d1] bg-white"></div>
								<div class="h-12 w-full rounded-md border border-[#d1d1d1] bg-white"></div>
							</div>

							<label class="mt-4 flex items-center gap-3 rounded-md bg-[#f7f7f7] px-3 py-3 text-sm text-[#4a4a4a]">
								<input bind:checked={saveInfo} type="checkbox" class="h-4 w-4 rounded border-[#8a8a8a]" />
								<span>Guardar esta información para la próxima vez</span>
							</label>
						</div>
					</div>

					<button
						type="button"
						class="mt-8 w-full rounded-xl bg-[#2f3c4f] px-6 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-transform hover:bg-[#253243] active:translate-y-px"
					>
						Pagar ahora
					</button>
				</div>
			</section>

			<aside class="rounded-none bg-[#FCA1201C] p-4 sm:p-6 lg:p-10">
				{#if cartList.length === 0}
					<div class="flex min-h-[240px] items-center justify-center text-center">
						<div>
							<p class="font-['Volkhov',serif] text-2xl text-[#262635]">Tu carrito está vacío</p>
							<p class="mt-2 text-sm text-[#6a6a6a]">Agrega productos para continuar con el pago.</p>
						</div>
					</div>
				{:else}
					<div class="space-y-5">
						{#each cartList as item (item.id)}
							<div class="flex items-start gap-4 border-b border-[#d3c9b8] pb-4 last:border-b-0 last:pb-0">
								<div class="relative h-24 w-20 flex-shrink-0 bg-[#ece4d6]">
									<img src={item.image} alt={item.name} class="h-full w-full rounded-md object-cover" />
									<span
										class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
									>
										{item.quantity}
									</span>
								</div>

								<div class="flex w-full items-start justify-between gap-4">
									<div>
										<p class="font-['Volkhov',serif] text-lg font-semibold text-[#262635]">
											{item.name}
										</p>
										<p class="mt-1 text-sm text-[#6a6a6a]">
											{item.color ?? 'General'}{item.size ? ` / ${item.size}` : ''}
										</p>
									</div>
									<p class="text-right text-base font-medium text-[#262635]">
										{formatPrice(item.price * item.quantity)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<div class="mt-6">
					<div class="flex items-center gap-2">
						<input
							bind:value={discountCode}
							placeholder="Código de descuento"
							class="h-12 w-full border border-[#d1d1d1] bg-white px-4 text-sm text-[#262635] outline-none placeholder:text-[#8a8a8a] focus:border-[#262635]"
						/>
						<button
							type="button"
							onclick={applyDiscount}
							class="h-12 rounded-xl bg-[#2f3c4f] px-5 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#253243]"
						>
							Aplicar
						</button>
					</div>
				</div>

				<div class="mt-8 space-y-4 text-[#454545]">
					<div class="flex items-center justify-between text-base">
						<span>Subtotal</span>
						<span>{formatPrice(subtotal)}</span>
					</div>
					<div class="flex items-center justify-between text-base">
						<span>Envío</span>
						<span>{formatPrice(shipping)}</span>
					</div>
					<div class="flex items-center justify-between border-t border-[#d3c9b8] pt-4 text-lg font-semibold text-[#262635]">
						<span>Total</span>
						<span>{formatPrice(total)}</span>
					</div>
				</div>
			</aside>
		</div>
	</div>
</div>
