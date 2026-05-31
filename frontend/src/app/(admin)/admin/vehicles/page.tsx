// src/app/(admin)/admin/vehicles/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesApi } from '@/lib/api'
import { Plus, Edit2, Truck, X, Save, Loader2 } from 'lucide-react'

const BLANK = {
  name: '', maxWeightKg: 0,
  perKmPricing: [{ ratePerKm: 15, baseFare: 500, minimumKm: 0, overnightCharge: 0 }],
}

export default function AdminVehiclesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.list().then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (data: any) => data.id
      ? vehiclesApi.update(data.id, data)
      : vehiclesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); setShowForm(false); setEditing(null) },
  })

  const form = editing || BLANK
  const setForm = (f: any) => setEditing(f)
  const pricing = form.perKmPricing?.[0] || {}
  const setPricing = (p: any) => setForm({ ...form, perKmPricing: [{ ...pricing, ...p }] })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-500 mt-1">Manage vehicle types and per-km delivery rates</p>
        </div>
        <button onClick={() => { setEditing({ ...BLANK, perKmPricing: [{ ratePerKm: 15, baseFare: 500, minimumKm: 0, overnightCharge: 0 }] }); setShowForm(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)
        ) : (vehicles || []).map((v: any) => {
          const p = v.perKmPricing?.[0]
          return (
            <div key={v.id} className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">{v.name}</div>
                <div className="text-sm text-gray-500">Max load: {(v.maxWeightKg / 1000).toFixed(1)} tons</div>
              </div>
              {p && (
                <div className="text-right">
                  <div className="font-semibold text-gray-900">₹{p.baseFare} base + ₹{p.ratePerKm}/km</div>
                  {p.overnightCharge > 0 && <div className="text-xs text-gray-400">Overnight: ₹{p.overnightCharge}</div>}
                </div>
              )}
              <button onClick={() => { setEditing({ ...v }); setShowForm(true) }} className="p-1.5 hover:bg-brand-50 rounded-lg text-gray-400 hover:text-brand-600">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>

      {showForm && form && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
          <div className="bg-white h-screen w-full max-w-md overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{form.id ? 'Edit Vehicle' : 'New Vehicle'}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Vehicle Name *</label>
                <input className="input-field text-sm" placeholder="e.g. Tata Ace" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Max Load (kg) *</label>
                <input type="number" className="input-field text-sm" value={form.maxWeightKg} onChange={e => setForm({ ...form, maxWeightKg: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="font-semibold text-sm text-gray-700 mb-4">Per-KM Pricing</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Base Fare (₹)</label>
                    <input type="number" className="input-field text-sm" value={pricing.baseFare} onChange={e => setPricing({ baseFare: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Rate per km (₹)</label>
                    <input type="number" className="input-field text-sm" value={pricing.ratePerKm} onChange={e => setPricing({ ratePerKm: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Minimum KM</label>
                    <input type="number" className="input-field text-sm" value={pricing.minimumKm} onChange={e => setPricing({ minimumKm: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Overnight Charge (₹)</label>
                    <input type="number" className="input-field text-sm" value={pricing.overnightCharge} onChange={e => setPricing({ overnightCharge: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <button onClick={() => saveMutation.mutate(form)} className="btn-primary w-full justify-center" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {form.id ? 'Save Changes' : 'Create Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
