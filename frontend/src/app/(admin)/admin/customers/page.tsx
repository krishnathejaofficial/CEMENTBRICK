// src/app/(admin)/admin/customers/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Users, Search, ShoppingBag, Phone, Mail } from 'lucide-react'

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('')

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminApi.customers().then(r => r.data),
  })

  const filtered = (customers || []).filter((c: any) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">{customers?.length || 0} registered customers</p>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9 py-2 text-sm" placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Customer', 'Contact', 'Orders', 'Total Business', 'Loyalty Points', 'Joined'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">
                      {c.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                      {c.referralCode && <div className="text-xs text-gray-400 font-mono">{c.referralCode}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {c.phone && <div className="flex items-center gap-1 text-xs text-gray-500"><Phone className="w-3 h-3" />{c.phone}</div>}
                  {c.email && <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><Mail className="w-3 h-3" />{c.email}</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm">
                    <ShoppingBag className="w-3 h-3 text-gray-400" />
                    {c._count?.orders || 0}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-brand-600">₹{(c.totalBusiness || 0).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="price-badge">{c.loyaltyPoints || 0} pts</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !isLoading && (
          <div className="py-16 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p>No customers found</p>
          </div>
        )}
      </div>
    </div>
  )
}
