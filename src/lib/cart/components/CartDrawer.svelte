<script lang="ts">
  import { Minus, Plus, Trash2, X } from '@lucide/svelte'
  import { formatPrice } from '$lib/utils/cartUtils'
  import type { CartItem } from '$lib/types/products'

  interface Props {
    isOpen: boolean
    cartItems: CartItem[]
    onClose: () => void
    onUpdateQuantity: (itemId: string, quantity: number) => void
    onRemoveItem: (itemId: string) => void
    onClearCart: () => void
  }

  let { isOpen, cartItems, onClose, onUpdateQuantity, onRemoveItem, onClearCart }: Props = $props()

  // Hacer que estos valores sean reactivos usando $derived con cartItems
  // Usamos el spread operator para forzar la reactividad
  const total = $derived([...cartItems].reduce((sum, item) => sum + item.price * item.quantity, 0))
  const totalItems = $derived([...cartItems].reduce((sum, item) => sum + item.quantity, 0))
  const menItems = $derived([...cartItems].filter(item => item.gender === 'men'))
  const womenItems = $derived([...cartItems].filter(item => item.gender === 'women'))
  
  // Valores derivados adicionales para mejorar la reactividad
  const menItemsCount = $derived(menItems.reduce((sum, item) => sum + item.quantity, 0))
  const womenItemsCount = $derived(womenItems.reduce((sum, item) => sum + item.quantity, 0))

  // =================== NUEVA LÓGICA: MÍNIMO 4 UNIDADES ===================
  const canCheckout = $derived(totalItems >= 4)
  const missingUnits = $derived(Math.max(0, 4 - totalItems))
</script>

{#if isOpen}
  <!-- Overlay -->
  <button 
    class="fixed inset-0 bg-black bg-opacity-50 z-40" 
    onclick={onClose}
    aria-label="Cerrar carrito"
  ></button>
  
  <!-- Drawer -->
  <div class="fixed right-0 top-0 h-full w-full sm:max-w-lg bg-white z-50 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b">
      <div>
        <h2 class="text-lg font-semibold">Carrito de Compras</h2>
        <p class="text-sm text-gray-600">{totalItems} productos • {formatPrice(total)}</p>
      </div>
      <button onclick={onClose} class="p-2 hover:bg-gray-100 rounded">
        <X class="h-5 w-5" />
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      {#if cartItems.length === 0}
        <div class="text-center py-8">
          <p class="text-gray-500">Tu carrito está vacío</p>
        </div>
      {:else}
        <div class="space-y-6">
          <!-- Sección Hombres -->
          {#if menItems.length > 0}
            <div>
              <h3 class="font-medium text-blue-900 mb-3 flex items-center">
                <div class="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                Hombres ({menItemsCount})
              </h3>
              <div class="space-y-3">
                {#each menItems as item (item.id + '-' + item.quantity)}
                  <div class="flex space-x-3 p-3 border rounded-lg">
                    <div class="w-16 h-16 flex-shrink-0">
                      <img src={item.image || '/placeholder.svg'} alt={item.name} class="w-full h-full object-cover rounded" />
                    </div>

                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-sm truncate">{item.name}</h4>
                      <div class="flex flex-wrap gap-1 mt-1">
                        {#if item.size}
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                            {item.size}
                          </span>
                        {/if}
                        {#if item.color}
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                            {item.color}
                          </span>
                        {/if}
                      </div>
                      <p class="text-sm font-medium text-gray-900 mt-1">{formatPrice(item.price)}</p>

                      <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center space-x-1">
                          <button
                            onclick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= item.minOrderQuantity}
                            class="h-6 w-6 p-0 border rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Minus class="h-3 w-3 mx-auto" />
                          </button>
                          <span class="text-sm px-2">{item.quantity}</span>
                          <button
                            onclick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            class="h-6 w-6 p-0 border rounded hover:bg-gray-50"
                          >
                            <Plus class="h-3 w-3 mx-auto" />
                          </button>
                        </div>

                        <button
                          onclick={() => onRemoveItem(item.id)}
                          class="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 class="h-3 w-3 mx-auto" />
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
              <h3 class="font-medium text-pink-900 mb-3 flex items-center">
                <div class="w-3 h-3 bg-pink-600 rounded-full mr-2"></div>
                Mujeres ({womenItemsCount})
              </h3>
              <div class="space-y-3">
                {#each womenItems as item (item.id + '-' + item.quantity)}
                  <div class="flex space-x-3 p-3 border rounded-lg">
                    <div class="w-16 h-16 flex-shrink-0">
                      <img src={item.image || '/placeholder.svg'} alt={item.name} class="w-full h-full object-cover rounded" />
                    </div>

                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-sm truncate">{item.name}</h4>
                      <div class="flex flex-wrap gap-1 mt-1">
                        {#if item.size}
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                            {item.size}
                          </span>
                        {/if}
                        {#if item.color}
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                            {item.color}
                          </span>
                        {/if}
                      </div>
                      <p class="text-sm font-medium text-gray-900 mt-1">{formatPrice(item.price)}</p>

                      <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center space-x-1">
                          <button
                            onclick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= item.minOrderQuantity}
                            class="h-6 w-6 p-0 border rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Minus class="h-3 w-3 mx-auto" />
                          </button>
                          <span class="text-sm px-2">{item.quantity}</span>
                          <button
                            onclick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            class="h-6 w-6 p-0 border rounded hover:bg-gray-50"
                          >
                            <Plus class="h-3 w-3 mx-auto" />
                          </button>
                        </div>

                        <button
                          onclick={() => onRemoveItem(item.id)}
                          class="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 class="h-3 w-3 mx-auto" />
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
      <div class="border-t p-4 space-y-4">
        <!-- Mínimo de unidades -->
        {#if !canCheckout}
          <div class="bg-orange-50 border border-orange-200 p-3 rounded-lg">
            <p class="text-orange-800 text-sm font-medium">
              📦 {totalItems}/4 unidades mínimas
            </p>
            <p class="text-orange-600 text-xs mt-1">
              Agrega {missingUnits} unidades más para proceder al pago
            </p>
          </div>
        {/if}

        <div class="flex justify-between items-center text-lg font-bold">
          <span>Total:</span>
          <span>{formatPrice(total)}</span>
        </div>

        <div class="space-y-2">
          <button 
            class="w-full py-2 px-4 rounded font-medium transition-colors {canCheckout 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}"
            disabled={!canCheckout}
          >
            {canCheckout ? 'Proceder al Checkout' : `Faltan ${missingUnits} unidades`}
          </button>
          <button onclick={onClearCart} class="w-full border border-gray-300 py-2 px-4 rounded hover:bg-gray-50">
            Limpiar Carrito
          </button>
        </div>
      </div>
    {/if}
  </div>
{/if}