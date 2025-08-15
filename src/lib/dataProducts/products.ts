import type { Product } from '$lib/shared/model/products'

export const sampleProducts: Product[] = [
  // Productos para Hombres (6 productos)
  {
    id: 'men-shirt-001',
    name: 'Camisa Formal Azul Marino',
    price: 180000,
    wholesalePrice: 128000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Camisas',
    gender: 'men',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Azul Marino', hex: '#1E3A8A' },
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Gris', hex: '#6B7280' }
    ],
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
    colors: [
      { name: 'Negro', hex: '#000000' },
      { name: 'Gris Oscuro', hex: '#374151' },
      { name: 'Azul Marino', hex: '#1E3A8A' }
    ],
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
    colors: [
      { name: 'Azul', hex: '#2563EB' },
      { name: 'Negro', hex: '#000000' },
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Rojo', hex: '#DC2626' }
    ],
    sku: 'MEN-PL-001',
    minOrderQuantity: 10,
    description: 'Polo deportivo de algodón piqué, ideal para uso casual',
    inStock: true,
    stockQuantity: 200
  },
  {
    id: 'men-jacket-001',
    name: 'Chaqueta de Cuero',
    price: 450000,
    wholesalePrice: 320000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Chaquetas',
    gender: 'men',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Negro', hex: '#000000' },
      { name: 'Marrón', hex: '#A16207' },
      { name: 'Gris', hex: '#6B7280' }
    ],
    sku: 'MEN-JK-001',
    minOrderQuantity: 2,
    description: 'Chaqueta de cuero genuino, estilo clásico y elegante',
    inStock: true,
    stockQuantity: 45
  },
  {
    id: 'men-tshirt-001',
    name: 'Camiseta Básica',
    price: 85000,
    wholesalePrice: 60000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Camisetas',
    gender: 'men',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Negro', hex: '#000000' },
      { name: 'Gris', hex: '#6B7280' },
      { name: 'Azul Marino', hex: '#1E3A8A' }
    ],
    sku: 'MEN-TS-001',
    minOrderQuantity: 8,
    description: 'Camiseta básica de algodón, perfecta para uso diario',
    inStock: true,
    stockQuantity: 300
  },
  {
    id: 'men-shoes-001',
    name: 'Zapatos Oxford',
    price: 380000,
    wholesalePrice: 270000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Zapatos',
    gender: 'men',
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: [
      { name: 'Negro', hex: '#000000' },
      { name: 'Marrón', hex: '#A16207' },
      { name: 'Cognac', hex: '#92400E' }
    ],
    sku: 'MEN-SH-001',
    minOrderQuantity: 2,
    description: 'Zapatos Oxford de cuero, perfectos para ocasiones formales',
    inStock: true,
    stockQuantity: 60
  },

  // Productos para Mujeres (6 productos)
  {
    id: 'women-blouse-001',
    name: 'Blusa Elegante Rosa',
    price: 208000,
    wholesalePrice: 144000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Blusas',
    gender: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Rosa', hex: '#EC4899' },
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Coral', hex: '#F97316' },
      { name: 'Lavanda', hex: '#C084FC' }
    ],
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
    colors: [
      { name: 'Floral Rosa', hex: '#F9A8D4' },
      { name: 'Floral Azul', hex: '#BFDBFE' },
      { name: 'Floral Verde', hex: '#BBF7D0' }
    ],
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
    colors: [
      { name: 'Azul Claro', hex: '#93C5FD' },
      { name: 'Azul Oscuro', hex: '#1E40AF' },
      { name: 'Negro', hex: '#000000' }
    ],
    sku: 'WOM-JN-001',
    minOrderQuantity: 4,
    description: 'Pantalón de mezclilla premium, corte moderno y cómodo',
    inStock: true,
    stockQuantity: 90
  },
  {
    id: 'women-skirt-001',
    name: 'Falda Elegante Plisada',
    price: 195000,
    wholesalePrice: 140000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Faldas',
    gender: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Negro', hex: '#000000' },
      { name: 'Gris', hex: '#6B7280' },
      { name: 'Azul Marino', hex: '#1E3A8A' },
      { name: 'Vino', hex: '#7F1D1D' }
    ],
    sku: 'WOM-SK-001',
    minOrderQuantity: 4,
    description: 'Falda plisada elegante, perfecta para la oficina',
    inStock: true,
    stockQuantity: 75
  },
  {
    id: 'women-cardigan-001',
    name: 'Cardigan de Lana',
    price: 285000,
    wholesalePrice: 200000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Cardigans',
    gender: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Beige', hex: '#D4B08A' },
      { name: 'Gris', hex: '#6B7280' },
      { name: 'Rosa Palo', hex: '#FBE2E3' },
      { name: 'Azul Cielo', hex: '#BAE6FD' }
    ],
    sku: 'WOM-CD-001',
    minOrderQuantity: 3,
    description: 'Cardigan suave de lana merino, ideal para cualquier ocasión',
    inStock: true,
    stockQuantity: 2
  },
  {
    id: 'women-heels-001',
    name: 'Tacones Clásicos',
    price: 320000,
    wholesalePrice: 230000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Zapatos',
    gender: 'women',
    sizes: ['35', '36', '37', '38', '39', '40'],
    colors: [
      { name: 'Negro', hex: '#000000' },
      { name: 'Nude', hex: '#F3E8D4' },
      { name: 'Rojo', hex: '#DC2626' },
      { name: 'Azul Marino', hex: '#1E3A8A' }
    ],
    sku: 'WOM-HE-001',
    minOrderQuantity: 2,
    description: 'Tacones clásicos de cuero, elegantes y cómodos',
    inStock: true,
    stockQuantity: 95
  },

  // Productos para Niños (6 productos)
  {
    id: 'boys-tshirt-001',
    name: 'Camiseta Deportiva Niño',
    price: 68000,
    wholesalePrice: 48000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Camisetas',
    gender: 'boys',
    sizes: ['4', '6', '8', '10', '12', '14'],
    colors: [
      { name: 'Azul', hex: '#2563EB' },
      { name: 'Rojo', hex: '#DC2626' },
      { name: 'Verde', hex: '#16A34A' },
      { name: 'Negro', hex: '#000000' }
    ],
    sku: 'BOY-TS-001',
    minOrderQuantity: 12,
    description: 'Camiseta deportiva para niños, tela transpirable y cómoda',
    inStock: true,
    stockQuantity: 200
  },
  {
    id: 'boys-shorts-001',
    name: 'Shorts Casual Niño',
    price: 72000,
    wholesalePrice: 52000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Shorts',
    gender: 'boys',
    sizes: ['4', '6', '8', '10', '12', '14'],
    colors: [
      { name: 'Azul Marino', hex: '#1E3A8A' },
      { name: 'Gris', hex: '#6B7280' },
      { name: 'Negro', hex: '#000000' },
      { name: 'Verde Militar', hex: '#4B5563' }
    ],
    sku: 'BOY-SH-001',
    minOrderQuantity: 8,
    description: 'Shorts casuales para niños, perfectos para el día a día',
    inStock: true,
    stockQuantity: 150
  },
  {
    id: 'boys-hoodie-001',
    name: 'Sudadera con Capucha Niño',
    price: 96000,
    wholesalePrice: 68000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Sudaderas',
    gender: 'boys',
    sizes: ['4', '6', '8', '10', '12', '14'],
    colors: [
      { name: 'Gris', hex: '#6B7280' },
      { name: 'Azul', hex: '#2563EB' },
      { name: 'Negro', hex: '#000000' },
      { name: 'Rojo', hex: '#DC2626' }
    ],
    sku: 'BOY-HD-001',
    minOrderQuantity: 6,
    description: 'Sudadera con capucha para niños, algodón suave y cálido',
    inStock: true,
    stockQuantity: 120
  },
  {
    id: 'boys-jeans-001',
    name: 'Jeans Clásicos Niño',
    price: 95000,
    wholesalePrice: 68000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Pantalones',
    gender: 'boys',
    sizes: ['4', '6', '8', '10', '12', '14'],
    colors: [
      { name: 'Azul Claro', hex: '#93C5FD' },
      { name: 'Azul Oscuro', hex: '#1E40AF' },
      { name: 'Negro', hex: '#000000' }
    ],
    sku: 'BOY-JN-001',
    minOrderQuantity: 6,
    description: 'Jeans clásicos para niños, resistentes y cómodos',
    inStock: true,
    stockQuantity: 110
  },
  {
    id: 'boys-polo-001',
    name: 'Polo Escolar Niño',
    price: 58000,
    wholesalePrice: 42000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Polos',
    gender: 'boys',
    sizes: ['4', '6', '8', '10', '12', '14'],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Azul Marino', hex: '#1E3A8A' },
      { name: 'Gris', hex: '#6B7280' },
      { name: 'Verde', hex: '#16A34A' }
    ],
    sku: 'BOY-PL-001',
    minOrderQuantity: 10,
    description: 'Polo escolar para niños, ideal para uniformes',
    inStock: true,
    stockQuantity: 180
  },
  {
    id: 'boys-sneakers-001',
    name: 'Tenis Deportivos Niño',
    price: 125000,
    wholesalePrice: 90000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Zapatos',
    gender: 'boys',
    sizes: ['25', '26', '27', '28', '29', '30', '31', '32'],
    colors: [
      { name: 'Azul', hex: '#2563EB' },
      { name: 'Negro', hex: '#000000' },
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Rojo', hex: '#DC2626' }
    ],
    sku: 'BOY-SN-001',
    minOrderQuantity: 4,
    description: 'Tenis deportivos para niños, cómodos y resistentes',
    inStock: true,
    stockQuantity: 140
  },

  // Productos para Niñas (6 productos)
  {
    id: 'girls-dress-001',
    name: 'Vestido Princesa Niña',
    price: 84000,
    wholesalePrice: 60000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Vestidos',
    gender: 'girls',
    sizes: ['4', '6', '8', '10', '12', '14'],
    colors: [
      { name: 'Rosa', hex: '#EC4899' },
      { name: 'Lila', hex: '#DDA0DD' },
      { name: 'Celeste', hex: '#0EA5E9' },
      { name: 'Blanco', hex: '#FFFFFF' }
    ],
    sku: 'GIR-DR-001',
    minOrderQuantity: 6,
    description: 'Vestido estilo princesa para niñas, perfecto para ocasiones especiales',
    inStock: true,
    stockQuantity: 100
  },
  {
    id: 'girls-leggings-001',
    name: 'Leggings Coloridos Niña',
    price: 52000,
    wholesalePrice: 38000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Leggings',
    gender: 'girls',
    sizes: ['4', '6', '8', '10', '12', '14'],
    colors: [
      { name: 'Rosa', hex: '#EC4899' },
      { name: 'Morado', hex: '#9333EA' },
      { name: 'Turquesa', hex: '#14B8A6' },
      { name: 'Coral', hex: '#F97316' }
    ],
    sku: 'GIR-LG-001',
    minOrderQuantity: 10,
    description: 'Leggings cómodos y coloridos para niñas, perfectos para jugar',
    inStock: true,
    stockQuantity: 160
  },
  {
    id: 'girls-blouse-001',
    name: 'Blusa Floral Niña',
    price: 76000,
    wholesalePrice: 54000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Blusas',
    gender: 'girls',
    sizes: ['4', '6', '8', '10', '12', '14'],
    colors: [
      { name: 'Floral Rosa', hex: '#F9A8D4' },
      { name: 'Floral Lila', hex: '#E9D5FF' },
      { name: 'Floral Amarillo', hex: '#FEF3C7' }
    ],
    sku: 'GIR-BL-001',
    minOrderQuantity: 8,
    description: 'Blusa con estampado floral para niñas, estilo dulce y elegante',
    inStock: true,
    stockQuantity: 140
  },
  {
    id: 'girls-skirt-001',
    name: 'Falda Plisada Escolar',
    price: 62000,
    wholesalePrice: 44000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Faldas',
    gender: 'girls',
    sizes: ['4', '6', '8', '10', '12', '14'],
    colors: [
      { name: 'Azul Marino', hex: '#1E3A8A' },
      { name: 'Gris', hex: '#6B7280' },
      { name: 'Verde', hex: '#16A34A' },
      { name: 'Vino', hex: '#7F1D1D' }
    ],
    sku: 'GIR-SK-001',
    minOrderQuantity: 8,
    description: 'Falda plisada escolar, cómoda y elegante',
    inStock: true,
    stockQuantity: 130
  },
  {
    id: 'girls-cardigan-001',
    name: 'Cardigan Escolar Niña',
    price: 88000,
    wholesalePrice: 63000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Cardigans',
    gender: 'girls',
    sizes: ['4', '6', '8', '10', '12', '14'],
    colors: [
      { name: 'Azul Marino', hex: '#1E3A8A' },
      { name: 'Gris', hex: '#6B7280' },
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Verde', hex: '#16A34A' }
    ],
    sku: 'GIR-CD-001',
    minOrderQuantity: 6,
    description: 'Cardigan escolar para niñas, suave y abrigado',
    inStock: true,
    stockQuantity: 115
  },
  {
    id: 'girls-shoes-001',
    name: 'Zapatos Escolares Niña',
    price: 98000,
    wholesalePrice: 70000,
    images: ['/placeholder.svg?height=400&width=400'],
    category: 'Zapatos',
    gender: 'girls',
    sizes: ['25', '26', '27', '28', '29', '30', '31', '32'],
    colors: [
      { name: 'Negro', hex: '#000000' },
      { name: 'Azul Marino', hex: '#1E3A8A' },
      { name: 'Marrón', hex: '#A16207' }
    ],
    sku: 'GIR-SH-001',
    minOrderQuantity: 4,
    description: 'Zapatos escolares para niñas, cómodos y duraderos',
    inStock: true,
    stockQuantity: 105
  }
]
