// src/app/(customer)/products/[slug]/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useCartStore } from '@/store/cart'
import { useState, Suspense } from 'react'
import { ArrowLeft, ShoppingCart, Package, Info, Check, ShieldCheck, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

function ProductDetail() {
  const { slug } = useParams()
  const router = useRouter()
  const addItem = useCartStore(s => s.addItem)
  const [quantity, setQuantity] = useState(1000)
  const [added, setAdded] = useState(false)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.get(slug as string).then(r => r.data),
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <Package className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="font-display text-2xl font-bold text-gray-800">Product Not Found</h1>
        <p className="text-gray-500 mt-2 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantity,
      unitPrice: product.basePrice,
      imageUrl: product.imageUrls?.[0],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Parse specifications if they are stored as JSON
  const specs = typeof product.specifications === 'string'
    ? JSON.parse(product.specifications)
    : product.specifications || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Back button */}
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Product Image */}
            <div className="card aspect-[4/3] bg-white relative flex items-center justify-center border border-gray-100">
              {product.imageUrls?.[0] ? (
                <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-earth-100/50">
                  <Package className="w-20 h-20 text-earth-400" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <span className="text-xs text-brand-600 font-bold uppercase tracking-wider">{product.category?.name}</span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-1">{product.name}</h1>
                <p className="text-gray-500 mt-3 leading-relaxed">{product.description || 'Premium building material of exceptional build and standard.'}</p>
              </div>

              {/* Pricing & Add to Cart */}
              <div className="card p-6 border border-gray-100 space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-gray-900">₹{product.basePrice}</span>
                  <span className="text-gray-400 text-sm">/ {product.unit}</span>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-600 block">Quantity to Order</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQuantity(q => Math.max(100, q - 100))} className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 font-bold">-</button>
                    <input
                      type="number"
                      value={quantity}
                      min={100}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      className="input-field text-center max-w-32 py-2"
                    />
                    <button onClick={() => setQuantity(q => q + 100)} className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 font-bold">+</button>
                    <span className="text-sm font-medium text-gray-500">{product.unit}s</span>
                  </div>
                </div>

                <button onClick={handleAddToCart} className="btn-primary w-full justify-center py-3.5">
                  {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {added ? 'Added to Cart!' : 'Add to Cart'}
                </button>
              </div>

              {/* Volume Discount Tiers */}
              {product.pricingTiers?.length > 0 && (
                <div className="card p-5 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500">
                    <Info className="w-4 h-4 text-brand-600" /> Volume Discounts
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-4 py-2 font-medium text-gray-600">Order Quantity</th>
                          <th className="px-4 py-2 font-medium text-gray-600 text-right">Price per unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.pricingTiers.map((tier: any) => (
                          <tr key={tier.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-2.5 text-gray-600">
                              {tier.maxQty ? `${tier.minQty.toLocaleString()} - ${tier.maxQty.toLocaleString()}` : `${tier.minQty.toLocaleString()}+`} {product.unit}s
                            </td>
                            <td className="px-4 py-2.5 font-semibold text-brand-600 text-right">
                              ₹{tier.pricePerUnit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Specifications */}
              {Object.keys(specs).length > 0 && (
                <div className="card p-5 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-brand-600" /> Specifications & Quality Standards
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(specs).map(([key, val]) => (
                      <div key={key} className="py-2 border-b border-gray-50 last:border-0 col-span-2 sm:col-span-1">
                        <div className="text-gray-400 capitalize text-xs mb-0.5">{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="font-medium text-gray-700">{val as string}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductDetail />
    </Suspense>
  )
}
