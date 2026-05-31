// src/components/customer/PriceEstimatorWidget.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { pricingApi, productsApi } from '@/lib/api'
import { Calculator, MapPin, Package, Loader2, IndianRupee } from 'lucide-react'

export function PriceEstimatorWidget() {
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1000)
  const [pincode, setPincode] = useState('')
  const [includeLabour, setIncludeLabour] = useState(false)
  const [includeFood, setIncludeFood] = useState(false)
  const [result, setResult] = useState<any>(null)

  const { data: products } = useQuery({
    queryKey: ['products-light'],
    queryFn: () => productsApi.list({ limit: 50 }).then(r => r.data.products),
  })

  const estimate = useMutation({
    mutationFn: () => pricingApi.estimate({
      items: [{ productId, quantity }],
      delivery: { pincode },
      options: { includeLabour, includeLabourFood: includeFood },
    }),
    onSuccess: (res) => setResult(res.data),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId || !pincode || quantity < 1) return
    estimate.mutate()
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
          <Calculator className="w-4 h-4 text-brand-600" />
        </div>
        <h3 className="font-display font-bold text-gray-900">Quick Price Estimate</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Product</label>
          <select
            className="input-field text-sm"
            value={productId}
            onChange={e => setProductId(e.target.value)}
            required
          >
            <option value="">Select a product...</option>
            {(products || []).map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} (₹{p.basePrice}/{p.unit})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Quantity</label>
          <input
            type="number"
            className="input-field text-sm"
            value={quantity}
            min={1}
            onChange={e => setQuantity(parseInt(e.target.value) || 0)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Delivery Pincode
          </label>
          <input
            type="text"
            className="input-field text-sm"
            placeholder="e.g. 517325"
            value={pincode}
            maxLength={6}
            onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
            required
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={includeLabour} onChange={e => setIncludeLabour(e.target.checked)} className="accent-brand-600" />
            Include Labour
          </label>
          {includeLabour && (
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={includeFood} onChange={e => setIncludeFood(e.target.checked)} className="accent-brand-600" />
              + Food
            </label>
          )}
        </div>

        <button type="submit" className="btn-primary w-full justify-center" disabled={estimate.isPending}>
          {estimate.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Calculating...</>
          ) : (
            <><Calculator className="w-4 h-4" /> Calculate Price</>
          )}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-5 border-t border-gray-100 pt-5 space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Price Breakdown</div>
          <div className="space-y-1.5 text-sm">
            <Row label="Materials" value={result.materialCost} />
            <Row label="Transport" value={result.transportCost} sub={result.distanceKm ? `${result.distanceKm} km` : result.zoneName} />
            {result.labourCost > 0 && <Row label={`Labour (${result.labourCount})`} value={result.labourCost} />}
            {result.labourFoodCost > 0 && <Row label="Labour Food" value={result.labourFoodCost} />}
            <Row label={`GST (${result.gstRate}%)`} value={result.gstAmount} />
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3 flex items-center justify-between">
            <span className="font-bold text-gray-900">Total Estimate</span>
            <span className="font-display text-2xl font-bold text-brand-600">₹{result.totalAmount.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-400 text-center">Vehicle: {result.vehicleType}</div>
          <a href="/quote" className="btn-primary w-full justify-center mt-3 text-sm">
            Proceed to Order
          </a>
        </div>
      )}

      {estimate.isError && (
        <div className="mt-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {(estimate.error as any)?.response?.data?.error || 'Could not calculate. Check your pincode.'}
        </div>
      )}
    </div>
  )
}

function Row({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="flex items-center justify-between text-gray-600">
      <span className="flex items-center gap-1">
        {label} {sub && <span className="text-xs text-gray-400">({sub})</span>}
      </span>
      <span className="font-medium text-gray-900">₹{value.toLocaleString()}</span>
    </div>
  )
}
