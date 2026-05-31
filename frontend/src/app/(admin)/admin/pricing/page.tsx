// src/app/(admin)/admin/pricing/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { productsApi, zonesApi, vehiclesApi, labourApi } from '@/lib/api'
import {
  DollarSign, Package, MapPin, Truck, Wrench, ArrowRight,
  TrendingUp, BarChart3, ShieldAlert
} from 'lucide-react'
import Link from 'next/link'

export default function AdminPricingDashboard() {
  // 1. Fetch Products for pricing tiers
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-pricing-products'],
    queryFn: () => productsApi.list({ limit: 100 }).then(r => r.data),
  })

  // 2. Fetch Zones
  const { data: zones, isLoading: loadingZones } = useQuery({
    queryKey: ['admin-pricing-zones'],
    queryFn: () => zonesApi.list().then(r => r.data),
  })

  // 3. Fetch Vehicles
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['admin-pricing-vehicles'],
    queryFn: () => vehiclesApi.list().then(r => r.data),
  })

  // 4. Fetch Labour settings
  const { data: labour, isLoading: loadingLabour } = useQuery({
    queryKey: ['admin-pricing-labour'],
    queryFn: () => labourApi.get().then(r => r.data),
  })

  const isLoading = loadingProducts || loadingZones || loadingVehicles || loadingLabour

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Pricing & Rate Matrix</h1>
          <p className="text-gray-500 mt-1">Unified view of all prices, delivery tariffs, transport rates, and labor costs</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products" className="btn-primary py-2 text-sm">
            Edit Products
          </Link>
        </div>
      </div>

      {/* Grid of Pricing Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Section 1: Product Pricing */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg">Product Base Prices</h2>
                  <p className="text-xs text-gray-400">Excluding transport and loader charges</p>
                </div>
              </div>
              <Link href="/admin/products" className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-semibold">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-2 font-medium">Material</th>
                    <th className="px-4 py-2 font-medium">Base Price</th>
                    <th className="px-4 py-2 font-medium">Volume Discounts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(productsData?.products || []).map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">₹{p.basePrice} <span className="text-xs text-gray-400">/{p.unit}</span></td>
                      <td className="px-4 py-3">
                        {p.pricingTiers?.length > 0 ? (
                          <div className="space-y-1">
                            {p.pricingTiers.map((t: any) => (
                              <div key={t.id} className="text-xs text-brand-600 font-semibold bg-brand-50 rounded px-1.5 py-0.5 inline-block mr-1">
                                {t.minQty}+: ₹{t.pricePerUnit}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">None configured</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 2: Delivery Zones */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg">Flat Delivery Zones</h2>
                  <p className="text-xs text-gray-400">Tariffs applied based on customer ZIP/PIN code</p>
                </div>
              </div>
              <Link href="/admin/zones" className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-semibold">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-2 font-medium">Zone Name</th>
                    <th className="px-4 py-2 font-medium">Flat Rate</th>
                    <th className="px-4 py-2 font-medium">Covered ZIPs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(zones || []).map((z: any) => (
                    <tr key={z.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{z.name}</td>
                      <td className="px-4 py-3 font-semibold text-brand-600">₹{z.flatCharge?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-48">
                        {z.pincodes?.join(', ') || 'No codes linked'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 3: Transportation & Vehicle Rates */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg">Vehicle per-KM Tariffs</h2>
                  <p className="text-xs text-gray-400">Used when routing is calculated beyond flat zones</p>
                </div>
              </div>
              <Link href="/admin/vehicles" className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-semibold">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-2 font-medium">Vehicle type</th>
                    <th className="px-4 py-2 font-medium">Base Fare</th>
                    <th className="px-4 py-2 font-medium">Per-KM Rate</th>
                    <th className="px-4 py-2 font-medium">Min KM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(vehicles || []).map((v: any) => {
                    const price = v.perKmPricing?.[0] || {}
                    return (
                      <tr key={v.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                        <td className="px-4 py-3 text-gray-600">₹{price.baseFare || 0}</td>
                        <td className="px-4 py-3 text-gray-900 font-semibold">₹{price.ratePerKm || 0}/km</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{price.minimumKm || 0} km</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 4: Labor & Loader Rates */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg">Loader & Site Labor</h2>
                  <p className="text-xs text-gray-400">Loading/unloading tariffs & food allowance</p>
                </div>
              </div>
              <Link href="/admin/labour" className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-semibold">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {labour && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                    <div className="text-xs text-gray-400 mb-1">Standard Load Rate</div>
                    <div className="font-display text-lg font-bold text-gray-900">₹{labour.ratePerThousand}</div>
                    <div className="text-xs text-gray-500 mt-0.5">per 1000 bricks handled</div>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                    <div className="text-xs text-gray-400 mb-1">Worker Food Charge</div>
                    <div className="font-display text-lg font-bold text-gray-900">₹{labour.foodChargePerPerson}</div>
                    <div className="text-xs text-gray-500 mt-0.5">per labourer / day (optional)</div>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Minimum Assigned Workers:</span>
                    <span className="font-semibold text-gray-800">{labour.minimumLabourCount} workers</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Capacity per Worker:</span>
                    <span className="font-semibold text-gray-800">{labour.bricksPerLabourer} bricks/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loader Overtime Tariff:</span>
                    <span className="font-semibold text-gray-800">₹{labour.overtimeRatePerHr}/hour</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
