// src/app/(admin)/admin/labour/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { labourApi } from '@/lib/api'
import { Save, Loader2, Users, Info } from 'lucide-react'

export default function AdminLabourPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    ratePerThousand: 200,
    minimumLabourCount: 2,
    bricksPerLabourer: 1000,
    foodChargePerPerson: 150,
    overtimeRatePerHr: 100,
    standardHoursPerDay: 8,
  })

  const { data: settings } = useQuery({
    queryKey: ['labour-settings'],
    queryFn: () => labourApi.get().then(r => r.data),
  })

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: () => labourApi.update(form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['labour-settings'] }),
  })

  const handle = (key: string, value: number) => setForm(f => ({ ...f, [key]: value }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Labour Settings</h1>
        <p className="text-gray-500 mt-1">Configure labour charges, food allowance, and overtime rates</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3 text-sm text-blue-700">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>Labour cost is automatically calculated as: <strong>ceil(total_bricks ÷ 1000) × Rate per 1000</strong>. Minimum {form.minimumLabourCount} labourers are always assigned.</div>
        </div>

        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-brand-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Labour Rate Configuration</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-2">Rate per 1000 Bricks (₹)</label>
              <input type="number" className="input-field" value={form.ratePerThousand} min={0} onChange={e => handle('ratePerThousand', parseFloat(e.target.value) || 0)} />
              <p className="text-xs text-gray-400 mt-1">Covers loading + unloading</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-2">Minimum Labour Count</label>
              <input type="number" className="input-field" value={form.minimumLabourCount} min={1} onChange={e => handle('minimumLabourCount', parseInt(e.target.value) || 1)} />
              <p className="text-xs text-gray-400 mt-1">Even for very small orders</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-2">Bricks per Labourer/Day</label>
              <input type="number" className="input-field" value={form.bricksPerLabourer} min={100} onChange={e => handle('bricksPerLabourer', parseInt(e.target.value) || 1000)} />
              <p className="text-xs text-gray-400 mt-1">Used to calculate how many labourers are needed</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-2">Standard Hours/Day</label>
              <input type="number" className="input-field" value={form.standardHoursPerDay} min={4} max={12} onChange={e => handle('standardHoursPerDay', parseInt(e.target.value) || 8)} />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-700 mb-4">Food & Overtime</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">Food Charge per Person/Day (₹)</label>
                <input type="number" className="input-field" value={form.foodChargePerPerson} min={0} onChange={e => handle('foodChargePerPerson', parseFloat(e.target.value) || 0)} />
                <p className="text-xs text-gray-400 mt-1">Customer can opt in/out at checkout</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">Overtime Rate per Hour (₹)</label>
                <input type="number" className="input-field" value={form.overtimeRatePerHr} min={0} onChange={e => handle('overtimeRatePerHr', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Preview Example</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
              {[
                { label: '1000 bricks', bricks: 1000 },
                { label: '5000 bricks', bricks: 5000 },
                { label: '10000 bricks', bricks: 10000 },
              ].map(ex => {
                const labourers = Math.max(form.minimumLabourCount, Math.ceil(ex.bricks / form.bricksPerLabourer))
                const cost = Math.ceil(ex.bricks / 1000) * form.ratePerThousand
                const food = labourers * form.foodChargePerPerson
                return (
                  <div key={ex.bricks} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500">{ex.label}</span>
                    <span className="font-medium">{labourers} workers · ₹{cost} labour {form.foodChargePerPerson > 0 && `+ ₹${food} food`}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <button onClick={() => saveMutation.mutate()} className="btn-primary" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Labour Settings
          </button>
          {saveMutation.isSuccess && <div className="text-green-600 text-sm">✓ Saved successfully</div>}
        </div>
      </div>
    </div>
  )
}
