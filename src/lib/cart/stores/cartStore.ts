import { writable, derived, type Writable } from 'svelte/store'
import { browser } from '$app/environment'
import type { Product, CartItem } from '$lib/types/products'

// =================== STORAGE UTILITIES ===================
class CartStorage {
  private static readonly STORAGE_KEY = 'cocos-cart'

  static load(): CartItem[] {
    if (!browser) return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      return []
    }
  }

  static save(items: CartItem[]): void {
    if (!browser) return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }

  static clear(): void {
    if (!browser) return
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

// =================== CART STORE CLASS ===================
class CartStore {
  private items: Writable<CartItem[]>

  constructor() {
    this.items = writable(CartStorage.load())
    
    // Auto-save cuando el store cambie
    if (browser) {
      this.items.subscribe((items) => {
        CartStorage.save(items)
      })
    }
  }

  // =================== GETTERS (STORES DERIVADOS) ===================
  get store() {
    return this.items
  }

  get totalItems() {
    return derived(this.items, ($items) => 
      $items.reduce((total, item) => total + item.quantity, 0)
    )
  }

  get totalPrice() {
    return derived(this.items, ($items) => 
      $items.reduce((total, item) => total + (item.price * item.quantity), 0)
    )
  }

  get menItems() {
    return derived(this.items, ($items) => 
      $items.filter(item => item.gender === 'men')
    )
  }

  get womenItems() {
    return derived(this.items, ($items) => 
      $items.filter(item => item.gender === 'women')
    )
  }

  get menItemCount() {
    return derived(this.menItems, ($menItems) => 
      $menItems.reduce((total, item) => total + item.quantity, 0)
    )
  }

  get womenItemCount() {
    return derived(this.womenItems, ($womenItems) => 
      $womenItems.reduce((total, item) => total + item.quantity, 0)
    )
  }

  get isEmpty() {
    return derived(this.items, ($items) => $items.length === 0)
  }

  // =================== NUEVA LÓGICA: MÍNIMO 4 UNIDADES TOTALES ===================
  get totalUnits() {
    return derived(this.items, ($items) => 
      $items.reduce((total, item) => total + item.quantity, 0)
    )
  }

  get canProceedToPayment() {
    return derived(this.items, ($items) => {
      const totalUnits = $items.reduce((total, item) => total + item.quantity, 0)
      return totalUnits >= 4
    })
  }

  get missingUnitsForPayment() {
    return derived(this.items, ($items) => {
      const totalUnits = $items.reduce((total, item) => total + item.quantity, 0)
      return Math.max(0, 4 - totalUnits)
    })
  }

  // =================== PRIVATE HELPERS ===================
  private generateItemId(product: Product, size: string | null, color: string | null): string {
    return `${product.id}-${size || 'no-size'}-${color || 'no-color'}`
  }

  private createCartItem(
    product: Product, 
    quantity: number, 
    size: string | null, 
    color: string | null
  ): CartItem {
    return {
      id: this.generateItemId(product, size, color),
      productId: product.id,
      name: product.name,
      price: product.wholesalePrice || product.price,
      image: product.images[0] || '/placeholder.svg',
      category: product.category,
      gender: product.gender,
      size,
      color,
      quantity: Math.max(quantity, 1), // ✅ Ahora mínimo 1 en lugar de minOrderQuantity
      sku: product.sku,
      minOrderQuantity: 1, // ✅ Nuevo mínimo global
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  private updateItemTimestamp(item: CartItem): void {
    item.updatedAt = new Date().toISOString()
  }

  // =================== PUBLIC METHODS ===================
  addItem(
    product: Product, 
    quantity: number = 1, 
    size: string | null = null, 
    color: string | null = null
  ): void {
    this.items.update(items => {
      const itemId = this.generateItemId(product, size, color)
      const existingIndex = items.findIndex(item => item.id === itemId)
      
      if (existingIndex >= 0) {
        // Actualizar item existente
        items[existingIndex].quantity += quantity
        this.updateItemTimestamp(items[existingIndex])
      } else {
        // Agregar nuevo item
        const newItem = this.createCartItem(product, quantity, size, color)
        items.push(newItem)
      }
      
      return items
    })
  }

  removeItem(itemId: string): void {
    this.items.update(items => items.filter(item => item.id !== itemId))
  }

  updateQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(itemId)
      return
    }

    this.items.update(items => {
      const item = items.find(item => item.id === itemId)
      if (item) {
        item.quantity = Math.max(newQuantity, 1) // ✅ Mínimo 1 en lugar de minOrderQuantity
        this.updateItemTimestamp(item)
      }
      return items
    })
  }

  incrementQuantity(itemId: string): void {
    this.items.update(items => {
      const item = items.find(item => item.id === itemId)
      if (item) {
        item.quantity += 1
        this.updateItemTimestamp(item)
      }
      return items
    })
  }

  decrementQuantity(itemId: string): void {
    this.items.update(items => {
      const item = items.find(item => item.id === itemId)
      if (item && item.quantity > item.minOrderQuantity) {
        item.quantity -= 1
        this.updateItemTimestamp(item)
      }
      return items
    })
  }

  clearCart(): void {
    this.items.set([])
  }

  clearByGender(gender: 'men' | 'women'): void {
    this.items.update(items => items.filter(item => item.gender !== gender))
  }

  // =================== UTILITY METHODS ===================
  getItemById(itemId: string): CartItem | undefined {
    let foundItem: CartItem | undefined
    this.items.subscribe(items => {
      foundItem = items.find(item => item.id === itemId)
    })()
    return foundItem
  }

  getItemsByCategory(category: string): CartItem[] {
    let categoryItems: CartItem[] = []
    this.items.subscribe(items => {
      categoryItems = items.filter(item => item.category === category)
    })()
    return categoryItems
  }

  exportAsJSON(): string {
    let currentItems: CartItem[] = []
    this.items.subscribe(items => {
      currentItems = items
    })()
    return JSON.stringify(currentItems, null, 2)
  }

  exportAsCSV(): string {
    let currentItems: CartItem[] = []
    this.items.subscribe(items => {
      currentItems = items
    })()
    
    const headers = ['SKU', 'Producto', 'Cantidad', 'Categoría', 'Precio', 'Género']
    const rows = currentItems.map(item => [
      item.sku,
      item.name,
      item.quantity.toString(),
      item.category,
      item.price.toString(),
      item.gender
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  // =================== BULK OPERATIONS ===================
  bulkAddItems(products: { product: Product; quantity: number; size?: string; color?: string }[]): void {
    this.items.update(items => {
      products.forEach(({ product, quantity, size = null, color = null }) => {
        const itemId = this.generateItemId(product, size, color)
        const existingIndex = items.findIndex(item => item.id === itemId)
        
        if (existingIndex >= 0) {
          items[existingIndex].quantity += quantity
          this.updateItemTimestamp(items[existingIndex])
        } else {
          const newItem = this.createCartItem(product, quantity, size, color)
          items.push(newItem)
        }
      })
      return items
    })
  }

  bulkUpdateQuantities(updates: { itemId: string; quantity: number }[]): void {
    this.items.update(items => {
      updates.forEach(({ itemId, quantity }) => {
        const item = items.find(item => item.id === itemId)
        if (item) {
          if (quantity <= 0) {
            const index = items.indexOf(item)
            items.splice(index, 1)
          } else {
            item.quantity = Math.max(quantity, item.minOrderQuantity)
            this.updateItemTimestamp(item)
          }
        }
      })
      return items
    })
  }
}

// =================== SINGLETON EXPORT ===================
export const cartStore = new CartStore()

// =================== CONVENIENCE EXPORTS ===================
export const cartItems = cartStore.store
export const cartItemCount = cartStore.totalItems
export const cartTotal = cartStore.totalPrice
export const menItems = cartStore.menItems
export const womenItems = cartStore.womenItems
export const menItemCount = cartStore.menItemCount
export const womenItemCount = cartStore.womenItemCount
export const isCartEmpty = cartStore.isEmpty

// =================== NUEVA LÓGICA DE PAGO ===================
export const totalUnits = cartStore.totalUnits
export const canProceedToPayment = cartStore.canProceedToPayment
export const missingUnitsForPayment = cartStore.missingUnitsForPayment
