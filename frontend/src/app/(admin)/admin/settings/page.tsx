// src/app/(admin)/admin/settings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { configApi } from '@/lib/api'
import { Save, Loader2, Settings, Building, Percent, MapPin } from 'lucide-react'

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    GST_RATE: '18',
    COMPANY_NAME: '',
    COMPANY_ADDRESS: '',
    COMPANY_PHONE: '',
    WHATSAPP_NUMBER: '',
    COMPANY_GST_NUMBER: '',
    INVOICE_PREFIX: 'BY',
    COMPANY_LAT: '',
    COMPANY_LNG: '',
  })

  const { data: config } = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => configApi.get().then(r => r.data),
  })

  useEffect(() => {
    if (config) setForm(f => ({ ...f, ...config }))
  }, [config])

  const saveMutation = useMutation({
    mutationFn: () => configApi.update(form),
  })

  const handle = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">System configuration, GST, and company information</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Company Info */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Company Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Company Name</label>
              <input className="input-field" value={form.COMPANY_NAME} onChange={e => handle('COMPANY_NAME', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Full Address</label>
              <textarea className="input-field min-h-16" value={form.COMPANY_ADDRESS} onChange={e => handle('COMPANY_ADDRESS', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">Phone</label>
                <input className="input-field" value={form.COMPANY_PHONE} onChange={e => handle('COMPANY_PHONE', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">WhatsApp Number</label>
                <input className="input-field" placeholder="91XXXXXXXXXX" value={form.WHATSAPP_NUMBER} onChange={e => handle('WHATSAPP_NUMBER', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">GST Registration Number</label>
              <input className="input-field font-mono" value={form.COMPANY_GST_NUMBER} onChange={e => handle('COMPANY_GST_NUMBER', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Depot Location */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Depot / Origin Location</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Distance calculations start from this point. Set your brick yard / factory coordinates.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Latitude</label>
              <input type="number" step="0.0001" className="input-field" value={form.COMPANY_LAT} onChange={e => handle('COMPANY_LAT', e.target.value)} placeholder="e.g. 13.5504" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Longitude</label>
              <input type="number" step="0.0001" className="input-field" value={form.COMPANY_LNG} onChange={e => handle('COMPANY_LNG', e.target.value)} placeholder="e.g. 78.5027" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Find coordinates at <a href="https://maps.google.com" target="_blank" rel="noopener" className="text-brand-600 hover:underline">maps.google.com</a> → right-click your location → copy coordinates</p>
        </div>

        {/* Tax & Invoice */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Percent className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Tax & Invoice</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">GST Rate (%)</label>
              <input type="number" className="input-field" value={form.GST_RATE} min={0} max={28} onChange={e => handle('GST_RATE', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Applied to material + transport</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Invoice Prefix</label>
              <input className="input-field font-mono" value={form.INVOICE_PREFIX} maxLength={6} onChange={e => handle('INVOICE_PREFIX', e.target.value.toUpperCase())} />
              <p className="text-xs text-gray-400 mt-1">e.g. BY → BY-2024-00123</p>
            </div>
          </div>
        </div>

        <button onClick={() => saveMutation.mutate()} className="btn-primary" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Settings
        </button>
        {saveMutation.isSuccess && <div className="text-green-600 text-sm font-medium">✓ Settings saved successfully</div>}
      </div>
    </div>
  )
}
