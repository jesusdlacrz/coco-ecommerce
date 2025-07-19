import type { Product } from '$lib/shared/model/products'

export const sampleProducts: Product[] = [
  // Productos para Hombres
  {
    id: 'men-shirt-001',
    name: 'Camisa Formal Azul Marino',
    price: 180000,
    wholesalePrice: 128000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Camisas',
    gender: 'men',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Azul Marino', 'Blanco', 'Gris'],
    sku: 'MEN-SH-001',
    minOrderQuantity: 5,
    description: 'Camisa formal de algodón 100% para uso empresarial',
    inStock: true,
    stockQuantity: 150
  },
  {
    id: 'men-pants-001',
    name: 'Pantalón de Vestir Negro',
    price: 272000,
    wholesalePrice: 192000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Pantalones',
    gender: 'men',
    sizes: ['30', '32', '34', '36', '38', '40'],
    colors: ['Negro', 'Gris Oscuro', 'Azul Marino'],
    sku: 'MEN-PT-001',
    minOrderQuantity: 3,
    description: 'Pantalón de vestir corte clásico, tela premium',
    inStock: true,
    stockQuantity: 80
  },
  {
    id: 'men-polo-001',
    name: 'Polo Deportivo',
    price: 128000,
    wholesalePrice: 88000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Polos',
    gender: 'men',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Azul', 'Negro', 'Blanco', 'Rojo'],
    sku: 'MEN-PL-001',
    minOrderQuantity: 10,
    description: 'Polo deportivo de algodón piqué, ideal para uso casual',
    inStock: true,
    stockQuantity: 200
  },

  // Productos para Mujeres
  {
    id: 'women-blouse-001',
    name: 'Blusa Elegante Rosa',
    price: 208000,
    wholesalePrice: 144000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Blusas',
    gender: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Rosa', 'Blanco', 'Coral', 'Lavanda'],
    sku: 'WOM-BL-001',
    minOrderQuantity: 5,
    description: 'Blusa elegante de seda sintética, perfecta para oficina',
    inStock: true,
    stockQuantity: 120
  },
  {
    id: 'women-dress-001',
    name: 'Vestido Casual Floral',
    price: 312000,
    wholesalePrice: 220000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Vestidos',
    gender: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Floral Rosa', 'Floral Azul', 'Floral Verde'],
    sku: 'WOM-DR-001',
    minOrderQuantity: 3,
    description: 'Vestido casual con estampado floral, tela fresca y cómoda',
    inStock: true,
    stockQuantity: 60
  },
  {
    id: 'women-pants-001',
    name: 'Pantalón de Mezclilla',
    price: 260000,
    wholesalePrice: 180000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Pantalones',
    gender: 'women',
    sizes: ['24', '26', '28', '30', '32', '34'],
    colors: ['Azul Claro', 'Azul Oscuro', 'Negro'],
    sku: 'WOM-JN-001',
    minOrderQuantity: 4,
    description: 'Pantalón de mezclilla premium, corte moderno y cómodo',
    inStock: true,
    stockQuantity: 90
  }
]