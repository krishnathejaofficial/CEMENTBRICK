// src/app/(customer)/products/page.tsx
'use client'

import { useState, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi, categoriesApi } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/customer/ProductCard'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function Products() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [page, setPage] = useState(1)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then(r => r.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, selectedCategory, page],
    queryFn: () => productsApi.list({ search, category: selectedCategory, page, limit: 12 }).then(r => r.data),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-8">
          <div className="container mx-auto">
            <h1 className="section-title mb-6">Our Products</h1>
            {/* Search */}
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="input-field pl-10"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <select
                className="input-field max-w-xs"
                value={selectedCategory}
                onChange={e => { setSelectedCategory(e.target.value); setPage(1) }}
              >
                <option value="">All Categories</option>
                {(categories || []).map((c: any) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-10">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card h-72 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-6">{data?.total || 0} products found</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(data?.products || []).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {data?.total > 12 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: Math.ceil(data.total / 12) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-brand-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Products />
    </Suspense>
  )
}
