export interface Product {
  id: string
  name: string
  price: number
  wholesalePrice?: number
  images: string[]
  category: string
  gender: 'men' | 'women' | 'boys' | 'girls'
  sizes: string[]
  colors: string[]
  sku: string
  minOrderQuantity: number
  description: string
  inStock: boolean
  stockQuantity: number
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  gender: 'men' | 'women' | 'boys' | 'girls'
  size: string | null
  color: string | null
  quantity: number
  sku: string
  minOrderQuantity: number
  discountApplied?: number
  addedAt: string
  updatedAt: string
}

export interface CartSummary {
  totalItems: number
  totalQuantity: number
  subtotal: number
  totalDiscount: number
  finalTotal: number
  byGender: {
    men: { items: number; quantity: number; total: number }
    women: { items: number; quantity: number; total: number }
    boys: { items: number; quantity: number; total: number }
    girls: { items: number; quantity: number; total: number }
  }
  byCategory: Record<string, { items: number; quantity: number; total: number }>
}