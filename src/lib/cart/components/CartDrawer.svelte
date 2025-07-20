<script lang="ts">
	import { formatPrice } from '$lib/shared/utils/cartUtils';
	import type { CartItem } from '$lib/shared/model/products';

	import X from '$lib/shared/icons/X.svelte';
	import Plus from '$lib/shared/icons/Plus.svelte';
	import Minus from '$lib/shared/icons/Minus.svelte';
	import Trash from '$lib/shared/icons/Trash.svelte';

	interface Props {
		isOpen: boolean;
		cartItems: CartItem[];
		onClose: () => void;
		onUpdateQuantity: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
		onClearCart: () => void;
	}

	let { isOpen, cartItems, onClose, onUpdateQuantity, onRemoveItem, onClearCart }: Props = $props();

	// Hacer que estos valores sean reactivos usando $derived con cartItems
	// Usamos el spread operator para forzar la reactividad
	const total = $derived([...cartItems].reduce((sum, item) => sum + item.price * item.quantity, 0));
	const totalItems = $derived([...cartItems].reduce((sum, item) => sum + item.quantity, 0));
	const menItems = $derived([...cartItems].filter((item) => item.gender === 'men'));
	const womenItems = $derived([...cartItems].filter((item) => item.gender === 'women'));
	const boysItems = $derived([...cartItems].filter((item) => item.gender === 'boys'));
	const girlsItems = $derived([...cartItems].filter((item) => item.gender === 'girls'));

	// Valores derivados adicionales para mejorar la reactividad
	const menItemsCount = $derived(menItems.reduce((sum, item) => sum + item.quantity, 0));
	const womenItemsCount = $derived(womenItems.reduce((sum, item) => sum + item.quantity, 0));
	const boysItemsCount = $derived(boysItems.reduce((sum, item) => sum + item.quantity, 0));
	const girlsItemsCount = $derived(girlsItems.reduce((sum, item) => sum + item.quantity, 0));

	const canCheckout = $derived(totalItems >= 4);
	const missingUnits = $derived(Math.max(0, 4 - totalItems));
</script>

{#if isOpen}
	<!-- Overlay -->
	<button class="fixed inset-0 z-40 bg-black/50" onclick={onClose} aria-label="Cerrar carrito"
	></button>

	<!-- Drawer -->
	<div class="fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white sm:max-w-lg">
		<!-- Header -->
		<div class="flex items-center justify-between border-b p-4">
			<div>
				<h2 class="text-lg font-semibold">Carrito de Compras</h2>
				<p class="text-sm text-gray-600">{totalItems} productos • {formatPrice(total)}</p>
			</div>
			<button onclick={onClose} class="rounded p-2 hover:bg-gray-100">
				<X size={20} />
			</button>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-4">
			{#if cartItems.length === 0}
				<div class="py-8 text-center">
					<p class="text-gray-500">Tu carrito está vacío</p>
				</div>
			{:else}
				<div class="space-y-6">
					<!-- Sección Hombres -->
					{#if menItems.length > 0}
						<div>
							<h3 class="mb-3 flex items-center font-medium text-blue-900">
								<div class="mr-2 h-3 w-3 rounded-full bg-blue-600"></div>
								Hombres ({menItemsCount})
							</h3>
							<div class="space-y-3">
								{#each menItems as item (item.id + '-' + item.quantity)}
									<div class="flex space-x-3 rounded-lg border p-3">
										<div class="h-16 w-16 flex-shrink-0">
											<img
												src={item.image || '/placeholder.svg'}
												alt={item.name}
												class="h-full w-full rounded object-cover"
											/>
										</div>

										<div class="min-w-0 flex-1">
											<h4 class="truncate text-sm font-medium">{item.name}</h4>
											<div class="mt-1 flex flex-wrap gap-1">
												{#if item.size}
													<span
														class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
													>
														{item.size}
													</span>
												{/if}
												{#if item.color}
													<span
														class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
													>
														{item.color}
													</span>
												{/if}
											</div>
											<p class="mt-1 text-sm font-medium text-gray-900">
												{formatPrice(item.price)}
											</p>

											<div class="mt-2 flex items-center justify-between">
												<div class="flex items-center space-x-2">
													<button
														onclick={() => onUpdateQuantity(item.id, item.quantity - 1)}
														disabled={item.quantity <= 1}
														class="flex h-8 w-8 items-center justify-center rounded border p-0 hover:bg-gray-50 disabled:opacity-50"
													>
														<Minus size={12} />
													</button>
													<span class="min-w-[2rem] px-3 text-center text-sm font-medium"
														>{item.quantity}</span
													>
													<button
														onclick={() => onUpdateQuantity(item.id, item.quantity + 1)}
														class="flex h-8 w-8 items-center justify-center rounded border p-0 hover:bg-gray-50"
													>
														<Plus size={12} />
													</button>
												</div>

												<button
													onclick={() => onRemoveItem(item.id)}
													class="h-6 w-6 p-0 text-red-500 hover:text-red-700"
												>
													<Trash size={12} />
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Sección Mujeres -->
					{#if womenItems.length > 0}
						<div>
							<h3 class="mb-3 flex items-center font-medium text-pink-900">
								<div class="mr-2 h-3 w-3 rounded-full bg-pink-600"></div>
								Mujeres ({womenItemsCount})
							</h3>
							<div class="space-y-3">
								{#each womenItems as item (item.id + '-' + item.quantity)}
									<div class="flex space-x-3 rounded-lg border p-3">
										<div class="h-16 w-16 flex-shrink-0">
											<img
												src={item.image || '/placeholder.svg'}
												alt={item.name}
												class="h-full w-full rounded object-cover"
											/>
										</div>

										<div class="min-w-0 flex-1">
											<h4 class="truncate text-sm font-medium">{item.name}</h4>
											<div class="mt-1 flex flex-wrap gap-1">
												{#if item.size}
													<span
														class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
													>
														{item.size}
													</span>
												{/if}
												{#if item.color}
													<span
														class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
													>
														{item.color}
													</span>
												{/if}
											</div>
											<p class="mt-1 text-sm font-medium text-gray-900">
												{formatPrice(item.price)}
											</p>

											<div class="mt-2 flex items-center justify-between">
												<div class="flex items-center space-x-2">
													<button
														onclick={() => onUpdateQuantity(item.id, item.quantity - 1)}
														disabled={item.quantity <= 1}
														class="flex h-8 w-8 items-center justify-center rounded border p-0 hover:bg-gray-50 disabled:opacity-50"
													>
														<Minus size={12} />
													</button>
													<span class="min-w-[2rem] px-3 text-center text-sm font-medium"
														>{item.quantity}</span
													>
													<button
														onclick={() => onUpdateQuantity(item.id, item.quantity + 1)}
														class="flex h-8 w-8 items-center justify-center rounded border p-0 hover:bg-gray-50"
													>
														<Plus size={12} />
													</button>
												</div>

												<button
													onclick={() => onRemoveItem(item.id)}
													class="h-6 w-6 p-0 text-red-500 hover:text-red-700"
												>
													<Trash size={12} />
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Sección Niños -->
					{#if boysItems.length > 0}
						<div>
							<h3 class="mb-3 flex items-center font-medium text-green-900">
								<div class="mr-2 h-3 w-3 rounded-full bg-green-600"></div>
								Niños ({boysItemsCount})
							</h3>
							<div class="space-y-3">
								{#each boysItems as item (item.id + '-' + item.quantity)}
									<div class="flex space-x-3 rounded-lg border p-3">
										<div class="h-16 w-16 flex-shrink-0">
											<img
												src={item.image || '/placeholder.svg'}
												alt={item.name}
												class="h-full w-full rounded object-cover"
											/>
										</div>

										<div class="min-w-0 flex-1">
											<h4 class="truncate text-sm font-medium">{item.name}</h4>
											<div class="mt-1 flex flex-wrap gap-1">
												{#if item.size}
													<span
														class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
													>
														{item.size}
													</span>
												{/if}
												{#if item.color}
													<span
														class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
													>
														{item.color}
													</span>
												{/if}
											</div>
											<p class="mt-1 text-sm font-medium text-gray-900">
												{formatPrice(item.price)}
											</p>

											<div class="mt-2 flex items-center justify-between">
												<div class="flex items-center space-x-2">
													<button
														onclick={() => onUpdateQuantity(item.id, item.quantity - 1)}
														disabled={item.quantity <= 1}
														class="flex h-8 w-8 items-center justify-center rounded border p-0 hover:bg-gray-50 disabled:opacity-50"
													>
														<Minus size={12} />
													</button>
													<span class="min-w-[2rem] px-3 text-center text-sm font-medium"
														>{item.quantity}</span
													>
													<button
														onclick={() => onUpdateQuantity(item.id, item.quantity + 1)}
														class="flex h-8 w-8 items-center justify-center rounded border p-0 hover:bg-gray-50"
													>
														<Plus size={12} />
													</button>
												</div>

												<button
													onclick={() => onRemoveItem(item.id)}
													class="h-6 w-6 p-0 text-red-500 hover:text-red-700"
												>
													<Trash size={12} />
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Sección Niñas -->
					{#if girlsItems.length > 0}
						<div>
							<h3 class="mb-3 flex items-center font-medium text-purple-900">
								<div class="mr-2 h-3 w-3 rounded-full bg-purple-600"></div>
								Niñas ({girlsItemsCount})
							</h3>
							<div class="space-y-3">
								{#each girlsItems as item (item.id + '-' + item.quantity)}
									<div class="flex space-x-3 rounded-lg border p-3">
										<div class="h-16 w-16 flex-shrink-0">
											<img
												src={item.image || '/placeholder.svg'}
												alt={item.name}
												class="h-full w-full rounded object-cover"
											/>
										</div>

										<div class="min-w-0 flex-1">
											<h4 class="truncate text-sm font-medium">{item.name}</h4>
											<div class="mt-1 flex flex-wrap gap-1">
												{#if item.size}
													<span
														class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
													>
														{item.size}
													</span>
												{/if}
												{#if item.color}
													<span
														class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
													>
														{item.color}
													</span>
												{/if}
											</div>
											<p class="mt-1 text-sm font-medium text-gray-900">
												{formatPrice(item.price)}
											</p>

											<div class="mt-2 flex items-center justify-between">
												<div class="flex items-center space-x-2">
													<button
														onclick={() => onUpdateQuantity(item.id, item.quantity - 1)}
														disabled={item.quantity <= 1}
														class="flex h-8 w-8 items-center justify-center rounded border p-0 hover:bg-gray-50 disabled:opacity-50"
													>
														<Minus size={12} />
													</button>
													<span class="min-w-[2rem] px-3 text-center text-sm font-medium"
														>{item.quantity}</span
													>
													<button
														onclick={() => onUpdateQuantity(item.id, item.quantity + 1)}
														class="flex h-8 w-8 items-center justify-center rounded border p-0 hover:bg-gray-50"
													>
														<Plus size={12} />
													</button>
												</div>

												<button
													onclick={() => onRemoveItem(item.id)}
													class="h-6 w-6 p-0 text-red-500 hover:text-red-700"
												>
													<Trash size={12} />
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		{#if cartItems.length > 0}
			<div class="space-y-4 border-t p-4">
				<!-- Mínimo de unidades -->
				{#if !canCheckout}
					<div class="rounded-lg border border-orange-200 bg-orange-50 p-3">
						<p class="text-sm font-medium text-orange-800">
							📦 {totalItems}/4 unidades mínimas
						</p>
						<p class="mt-1 text-xs text-orange-600">
							Agrega {missingUnits} unidades más para proceder al pago
						</p>
					</div>
				{/if}

				<div class="flex items-center justify-between text-lg font-bold">
					<span>Total:</span>
					<span>{formatPrice(total)}</span>
				</div>

				<div class="space-y-2">
					<button
						class="w-full rounded px-4 py-2 font-medium transition-colors {canCheckout
							? 'bg-green-600 text-white hover:bg-green-700'
							: 'cursor-not-allowed bg-gray-300 text-gray-500'}"
						disabled={!canCheckout}
					>
						{canCheckout ? 'Proceder al Checkout' : `Faltan ${missingUnits} unidades`}
					</button>
					<button
						onclick={onClearCart}
						class="w-full rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
					>
						Limpiar Carrito
					</button>
				</div>
			</div>
		{/if}
	</div>
{/if}
