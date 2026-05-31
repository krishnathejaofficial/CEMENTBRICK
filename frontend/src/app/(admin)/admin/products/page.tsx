// src/app/(admin)/admin/products/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, categoriesApi } from '@/lib/api'
import { Plus, Edit2, Trash2, Package, Search, X, Save, Loader2 } from 'lucide-react'

const BLANK_PRODUCT = {
  name: '', slug: '', categoryId: '', description: '', unit: 'brick',
  basePrice: 0, weight: 0, stockStatus: 'IN_STOCK', isFeatured: false,
  pricingTiers: [] as any[],
}

export default function AdminProductsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: () => productsApi.list({ search, limit: 50 }).then(r => r.data),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (data: any) => data.id
      ? productsApi.update(data.id, data)
      : productsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setShowForm(false); setEditing(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  const form = editing || BLANK_PRODUCT
  const setForm = (f: any) => setEditing(f)

  const openNew = () => { setEditing({ ...BLANK_PRODUCT }); setShowForm(true) }
  const openEdit = (p: any) => { setEditing({ ...p }); setShowForm(true) }

  const addTier = () => setForm({ ...form, pricingTiers: [...(form.pricingTiers || []), { minQty: 0, maxQty: null, pricePerUnit: 0 }] })
  const updateTier = (i: number, key: string, val: any) => {
    const tiers = [...(form.pricingTiers || [])]
    tiers[i] = { ...tiers[i], [key]: val }
    setForm({ ...form, pricingTiers: tiers })
  }
  const removeTier = (i: number) => {
    const tiers = [...(form.pricingTiers || [])]
    tiers.splice(i, 1)
    setForm({ ...form, pricingTiers: tiers })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">{productsData?.total || 0} products</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9 py-2 text-sm" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-gray-100" />)
        ) : (productsData?.products || []).map((p: any) => (
          <div key={p.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-earth-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-earth-600" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-brand-50 rounded-lg text-gray-400 hover:text-brand-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id) }}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="font-semibold text-gray-900 mb-1 line-clamp-2">{p.name}</div>
            <div className="text-xs text-gray-400 mb-3">{p.category?.name}</div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-brand-600">₹{p.basePrice}</span>
                <span className="text-xs text-gray-400">/{p.unit}</span>
              </div>
              <span className={`status-badge text-xs ${p.stockStatus === 'IN_STOCK' ? 'bg-green-100 text-green-700' : p.stockStatus === 'MADE_TO_ORDER' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                {p.stockStatus?.replace('_', ' ')}
              </span>
            </div>
            {p.pricingTiers?.length > 0 && (
              <div className="mt-2 text-xs text-gray-400">{p.pricingTiers.length} pricing tier(s)</div>
            )}
          </div>
        ))}
      </div>

      {/* Product form modal */}
      {showForm && form && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
          <div className="bg-white h-screen w-full max-w-xl overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{form.id ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Product Name *</label>
                  <input className="input-field text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Slug (URL)</label>
                  <input className="input-field text-sm" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Category *</label>
                <select className="input-field text-sm" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Select category...</option>
                  {(categories || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Description</label>
                <textarea className="input-field text-sm min-h-20" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Unit *</label>
                  <select className="input-field text-sm" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    {['brick', 'bag', 'ton', 'sq_ft', 'piece'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Base Price (₹) *</label>
                  <input type="number" className="input-field text-sm" value={form.basePrice} min={0} step={0.01} onChange={e => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Weight (kg/unit)</label>
                  <input type="number" className="input-field text-sm" value={form.weight} min={0} step={0.01} onChange={e => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Stock Status</label>
                  <select className="input-field text-sm" value={form.stockStatus} onChange={e => setForm({ ...form, stockStatus: e.target.value })}>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="MADE_TO_ORDER">Made to Order</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-brand-600" />
                    Featured product
                  </label>
                </div>
              </div>

              {/* Pricing Tiers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Volume Pricing Tiers</label>
                  <button type="button" onClick={addTier} className="text-xs text-brand-600 hover:underline">+ Add Tier</button>
                </div>
                {(form.pricingTiers || []).map((tier: any, i: number) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <input type="number" placeholder="Min qty" className="input-field text-xs py-2" value={tier.minQty} onChange={e => updateTier(i, 'minQty', parseInt(e.target.value))} />
                    <input type="number" placeholder="Max qty (blank=∞)" className="input-field text-xs py-2" value={tier.maxQty || ''} onChange={e => updateTier(i, 'maxQty', e.target.value ? parseInt(e.target.value) : null)} />
                    <input type="number" placeholder="Price/unit" className="input-field text-xs py-2" value={tier.pricePerUnit} onChange={e => updateTier(i, 'pricePerUnit', parseFloat(e.target.value))} />
                    <button type="button" onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => saveMutation.mutate(form)}
                className="btn-primary w-full justify-center"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {form.id ? 'Save Changes' : 'Create Product'}
              </button>
              {saveMutation.isError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {(saveMutation.error as any)?.response?.data?.error || 'Failed to save product'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
