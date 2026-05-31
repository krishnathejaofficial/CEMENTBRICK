// src/app/(admin)/admin/reports/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { TrendingUp, IndianRupee, ShoppingCart, Download } from 'lucide-react'

export default function AdminReportsPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])

  const { data, isLoading } = useQuery({
    queryKey: ['sales-report', from, to],
    queryFn: () => adminApi.salesReport({ from, to }).then(r => r.data),
  })

  // Group by day for chart
  const chartData = (() => {
    if (!data?.orders) return []
    const byDay: Record<string, { date: string; revenue: number; orders: number }> = {}
    data.orders.forEach((o: any) => {
      const day = new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      if (!byDay[day]) byDay[day] = { date: day, revenue: 0, orders: 0 }
      byDay[day].revenue += o.totalAmount
      byDay[day].orders += 1
    })
    return Object.values(byDay)
  })()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Sales analytics and performance insights</p>
        </div>
      </div>

      {/* Date range filter */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>From:</span>
          <input type="date" className="input-field py-2 text-sm" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>To:</span>
          <input type="date" className="input-field py-2 text-sm" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="ml-auto text-sm text-gray-500">
          {data?.orderCount || 0} orders in period
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'bg-green-50 text-green-600' },
          { label: 'Paid Revenue', value: `₹${(data?.paidRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Orders', value: data?.orderCount || 0, icon: ShoppingCart, color: 'bg-purple-50 text-purple-600' },
        ].map((k, i) => (
          <div key={i} className="card p-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.color} mb-4`}>
              <k.icon className="w-5 h-5" />
            </div>
            {isLoading ? <div className="h-8 bg-gray-100 rounded animate-pulse mb-1" /> : (
              <div className="font-display text-2xl font-bold text-gray-900 mb-1">{k.value}</div>
            )}
            <div className="text-sm text-gray-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-6">Daily Revenue</h2>
        {isLoading ? (
          <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">No data for selected period</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Orders chart */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-6">Daily Orders</h2>
        {isLoading ? (
          <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#c2410c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
