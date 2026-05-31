// src/app/(admin)/admin/zones/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { zonesApi } from '@/lib/api'
import { Plus, Edit2, Trash2, MapPin, X, Save, Loader2 } from 'lucide-react'

const BLANK_ZONE = {
  name: '', type: 'pincode', pincodes: [] as string[],
  centerLat: undefined, centerLng: undefined, radiusKm: undefined,
  flatCharge: 0, isActive: true,
}

export default function AdminZonesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [pincodeInput, setPincodeInput] = useState('')

  const { data: zones, isLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zonesApi.list().then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (data: any) => data.id
      ? zonesApi.update(data.id, data)
      : zonesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['zones'] }); setShowForm(false); setEditing(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => zonesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
  })

  const form = editing || BLANK_ZONE
  const setForm = (f: any) => setEditing(f)

  const addPincode = () => {
    if (pincodeInput.length === 6 && !form.pincodes.includes(pincodeInput)) {
      setForm({ ...form, pincodes: [...form.pincodes, pincodeInput] })
      setPincodeInput('')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Delivery Zones</h1>
          <p className="text-gray-500 mt-1">Manage fixed-price delivery zones. Other locations use per-km rates.</p>
        </div>
        <button onClick={() => { setEditing({ ...BLANK_ZONE }); setShowForm(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Zone
        </button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <strong>How it works:</strong> Deliveries to pincodes/areas in these zones are charged a flat rate. All other locations are charged based on distance (per-km) from your depot.
      </div>

      {/* Zones list */}
      <div className="grid gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)
        ) : (zones || []).length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p>No delivery zones configured yet</p>
          </div>
        ) : (zones || []).map((zone: any) => (
          <div key={zone.id} className="card p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-gray-900">{zone.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 capitalize">Type: {zone.type}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display text-xl font-bold text-brand-600">₹{zone.flatCharge}</div>
                  <div className="text-xs text-gray-400">flat delivery charge</div>
                </div>
              </div>
              {zone.type === 'pincode' && zone.pincodes?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {zone.pincodes.map((p: string) => (
                    <span key={p} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-mono">{p}</span>
                  ))}
                </div>
              )}
              {zone.type === 'radius' && (
                <div className="text-xs text-gray-500 mt-2">
                  Center: {zone.centerLat}, {zone.centerLng} · Radius: {zone.radiusKm} km
                </div>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => { setEditing({ ...zone }); setShowForm(true) }} className="p-1.5 hover:bg-brand-50 rounded-lg text-gray-400 hover:text-brand-600">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => { if (confirm('Delete this zone?')) deleteMutation.mutate(zone.id) }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Zone form modal */}
      {showForm && form && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
          <div className="bg-white h-screen w-full max-w-lg overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{form.id ? 'Edit Zone' : 'New Zone'}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Zone Name *</label>
                <input className="input-field text-sm" placeholder="e.g. Madanapalle Town" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Zone Type</label>
                <select className="input-field text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="pincode">PIN Codes</option>
                  <option value="radius">Radius from Depot</option>
                </select>
              </div>

              {form.type === 'pincode' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">PIN Codes</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      className="input-field text-sm flex-1"
                      placeholder="Enter 6-digit PIN"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={e => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={e => e.key === 'Enter' && addPincode()}
                    />
                    <button type="button" onClick={addPincode} className="btn-primary px-4 py-2 text-sm">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(form.pincodes || []).map((p: string) => (
                      <span key={p} className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded-full font-mono">
                        {p}
                        <button type="button" onClick={() => setForm({ ...form, pincodes: form.pincodes.filter((x: string) => x !== p) })} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {form.type === 'radius' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Center Lat</label>
                    <input type="number" step="0.0001" className="input-field text-sm" value={form.centerLat || ''} onChange={e => setForm({ ...form, centerLat: parseFloat(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Center Lng</label>
                    <input type="number" step="0.0001" className="input-field text-sm" value={form.centerLng || ''} onChange={e => setForm({ ...form, centerLng: parseFloat(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Radius (km)</label>
                    <input type="number" step="0.5" className="input-field text-sm" value={form.radiusKm || ''} onChange={e => setForm({ ...form, radiusKm: parseFloat(e.target.value) })} />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Flat Delivery Charge (₹) *</label>
                <input type="number" className="input-field text-sm" value={form.flatCharge} min={0} onChange={e => setForm({ ...form, flatCharge: parseFloat(e.target.value) || 0 })} />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-brand-600" />
                Zone is active
              </label>

              <button onClick={() => saveMutation.mutate(form)} className="btn-primary w-full justify-center" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {form.id ? 'Save Changes' : 'Create Zone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
