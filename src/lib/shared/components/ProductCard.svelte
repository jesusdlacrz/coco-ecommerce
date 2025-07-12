<script lang="ts">
  import { ShoppingCart, Plus, Minus } from '@lucide/svelte'
  import { formatPrice } from '$lib/utils/cartUtils'
  import type { Product } from '$lib/types/products'

  interface Props {
    product: Product
    onAddToCart: (product: Product, quantity: number, size: string | null, color: string | null) => void
  }

  let { product, onAddToCart }: Props = $props()

  let selectedSize = $state('')
  let selectedColor = $state('')
  let quantity = $state(product.minOrderQuantity)

  const genderColors = {
    men: {
      primary: 'bg-blue-600 hover:bg-blue-700',
      secondary: 'border-blue-200 bg-blue-50',
      text: 'text-blue-900'
    },
    women: {
      primary: 'bg-pink-600 hover:bg-pink-700',
      secondary: 'border-pink-200 bg-pink-50',
      text: 'text-pink-900'
    }
  }

  const colors = genderColors[product.gender]

  function handleAddToCart() {
    if (product.sizes.length > 0 && !selectedSize) {
      alert('Por favor selecciona una talla')
      return
    }
    if (product.colors.length > 0 && !selectedColor) {
      alert('Por favor selecciona un color')
      return
    }

    onAddToCart(product, quantity, selectedSize || null, selectedColor || null)

    // Reset selections
    selectedSize = ''
    selectedColor = ''
    quantity = product.minOrderQuantity
  }

  function incrementQuantity() {
    quantity += 1
  }

  function decrementQuantity() {
    if (quantity > product.minOrderQuantity) {
      quantity -= 1
    }
  }
</script>

<div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow {colors.secondary}">
  <div class="p-4">
    <div class="aspect-square relative mb-4">
      <img
        src={product.images[0] || '/placeholder.svg'}
        alt={product.name}
        class="w-full h-full object-cover rounded-md"
      />
    </div>
    
    <div class="space-y-2">
      <div class="flex items-start justify-between">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 {colors.text}">
          {product.category}
        </span>
        <span class="text-xs text-gray-500">SKU: {product.sku}</span>
      </div>
      <h3 class="text-lg font-semibold leading-tight">{product.name}</h3>
    </div>
  </div>

  <div class="p-4 pt-0 space-y-4">
    <p class="text-sm text-gray-600 line-clamp-2">{product.description}</p>

    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-lg font-bold text-gray-900">
          {formatPrice(product.wholesalePrice || product.price)}
        </span>
        {#if product.wholesalePrice}
          <span class="text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>
        {/if}
      </div>
      <p class="text-xs text-gray-500">
        Mín. {product.minOrderQuantity} piezas • Stock: {product.stockQuantity}
      </p>
    </div>

    <!-- Selección de talla -->
    {#if product.sizes.length > 0}
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Talla:</label>
        <select bind:value={selectedSize} class="w-full p-2 border border-gray-300 rounded-md">
          <option value="">Seleccionar talla</option>
          {#each product.sizes as size}
            <option value={size}>{size}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Selección de color -->
    {#if product.colors.length > 0}
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-1">Color:</label>
        <select bind:value={selectedColor} class="w-full p-2 border border-gray-300 rounded-md">
          <option value="">Seleccionar color</option>
          {#each product.colors as color}
            <option value={color}>{color}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Cantidad -->
    <div>
      <label class="text-sm font-medium text-gray-700 block mb-1">Cantidad:</label>
      <div class="flex items-center space-x-2">
        <button
          onclick={decrementQuantity}
          disabled={quantity <= product.minOrderQuantity}
          class="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          <Minus class="h-4 w-4" />
        </button>
        <span class="px-3 py-1 border rounded text-center min-w-[60px]">{quantity}</span>
        <button
          onclick={incrementQuantity}
          class="p-1 border border-gray-300 rounded hover:bg-gray-50"
        >
          <Plus class="h-4 w-4" />
        </button>
      </div>
    </div>

    <button
      onclick={handleAddToCart}
      class="w-full flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-md {colors.primary}"
    >
      <ShoppingCart class="h-4 w-4" />
      <span>Agregar al Carrito</span>
    </button>
  </div>
</div>