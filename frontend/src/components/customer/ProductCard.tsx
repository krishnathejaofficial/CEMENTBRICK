// src/components/customer/ProductCard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Package } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useState } from 'react'

interface Product {
  id: string
  name: string
  slug: string
  unit: string
  basePrice: number
  stockStatus: string
  imageUrls: string[]
  pricingTiers: any[]
  category: { name: string }
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(s => s.addItem)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantity: 100,
      unitPrice: product.basePrice,
      imageUrl: product.imageUrls?.[0],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const hasTiers = product.pricingTiers?.length > 0
  const lowestPrice = hasTiers
    ? Math.min(...product.pricingTiers.map((t: any) => t.pricePerUnit))
    : product.basePrice

  return (
    <div className="card group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          {product.imageUrls?.[0] ? (
            <Image src={product.imageUrls[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-earth-100">
              <Package className="w-12 h-12 text-earth-400" />
            </div>
          )}
          {/* Stock badge */}
          <div className={`absolute top-3 right-3 status-badge text-xs ${
            product.stockStatus === 'IN_STOCK' ? 'bg-green-100 text-green-700' :
            product.stockStatus === 'MADE_TO_ORDER' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {product.stockStatus.replace('_', ' ')}
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="text-xs text-brand-600 font-semibold mb-1">{product.category?.name}</div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">{product.name}</h3>
        </Link>

        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xs text-gray-400">Starting from</div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-xl font-bold text-gray-900">₹{lowestPrice}</span>
              <span className="text-xs text-gray-400">/{product.unit}</span>
            </div>
          </div>
          {hasTiers && (
            <span className="price-badge text-xs">Volume discounts</span>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/products/${product.slug}`} className="flex-1 text-center text-sm border border-gray-200 hover:border-brand-300 text-gray-600 hover:text-brand-600 px-3 py-2 rounded-lg transition-all">
            Details
          </Link>
          <button
            onClick={handleAdd}
            className="flex-1 btn-primary text-sm py-2 px-3 justify-center"
          >
            {added ? '✓ Added' : <><ShoppingCart className="w-3 h-3" /> Add</>}
          </button>
        </div>
      </div>
    </div>
  )
}
