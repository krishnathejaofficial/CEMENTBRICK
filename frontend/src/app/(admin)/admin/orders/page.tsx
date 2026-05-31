// src/app/(admin)/admin/orders/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api'
import { Search, Filter, RefreshCw, ChevronDown } from 'lucide-react'

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'MANUFACTURING', 'DISPATCHED', 'DELIVERED', 'CANCELLED']
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  MANUFACTURING: 'bg-purple-100 text-purple-700',
  DISPATCHED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function AdminOrdersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, statusFilter, page],
    queryFn: () => ordersApi.list({ search, status: statusFilter, page, limit: 15 }).then(r => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
    onSettled: () => setUpdatingId(null),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">{data?.total || 0} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9 py-2 text-sm" placeholder="Search by order # or customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input-field max-w-48 py-2 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => qc.invalidateQueries({ queryKey: ['admin-orders'] })} className="btn-ghost border border-gray-200 py-2">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Order</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Location</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (data?.orders || []).map((order: any) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-sm text-gray-900">{order.orderNumber}</div>
                    <div className="text-xs text-gray-400">{order.items?.length} item(s)</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-xs text-gray-400">{order.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{order.deliveryCity}</div>
                    <div className="text-xs text-gray-400">{order.deliveryPincode}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</div>
                    <div className={`text-xs ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.paymentStatus}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${STATUS_COLOR[order.status] || ''}`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:border-brand-400 outline-none"
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={e => {
                        setUpdatingId(order.id)
                        updateStatus.mutate({ id: order.id, status: e.target.value })
                      }}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.total > 15 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Page {page} of {Math.ceil(data.total / 15)}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost border border-gray-200 py-1.5 px-3 text-sm disabled:opacity-40">Previous</button>
              <button disabled={page >= Math.ceil(data.total / 15)} onClick={() => setPage(p => p + 1)} className="btn-ghost border border-gray-200 py-1.5 px-3 text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
