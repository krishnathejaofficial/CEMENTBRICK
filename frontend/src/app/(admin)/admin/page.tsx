// src/app/(admin)/admin/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { TrendingUp, ShoppingCart, Users, Clock, Package, ArrowUpRight, IndianRupee } from 'lucide-react'
import Link from 'next/link'

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  MANUFACTURING: 'bg-purple-100 text-purple-700',
  DISPATCHED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard().then(r => r.data),
    refetchInterval: 30000,
  })

  const kpis = data?.kpis || {}

  const KPI_CARDS = [
    { label: 'Total Revenue', value: `₹${(kpis.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'bg-green-50 text-green-600', change: '+12% this month' },
    { label: 'Total Orders', value: kpis.totalOrders || 0, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600', change: `${kpis.todayOrders || 0} today` },
    { label: 'Pending Orders', value: kpis.pendingOrders || 0, icon: Clock, color: 'bg-amber-50 text-amber-600', change: 'Needs attention' },
    { label: 'Total Customers', value: kpis.totalCustomers || 0, icon: Users, color: 'bg-purple-50 text-purple-600', change: 'Registered users' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your business</p>
        </div>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {KPI_CARDS.map((kpi, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300" />
            </div>
            {isLoading ? (
              <div className="h-8 bg-gray-100 rounded animate-pulse mb-2" />
            ) : (
              <div className="font-display text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
            )}
            <div className="text-sm text-gray-500">{kpi.label}</div>
            <div className="text-xs text-gray-400 mt-1">{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Orders by Status */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-1">
          <h2 className="font-semibold text-gray-800 mb-5">Orders by Status</h2>
          <div className="space-y-3">
            {(data?.ordersByStatus || []).map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className={`status-badge ${STATUS_COLOR[item.status] || 'bg-gray-100 text-gray-600'}`}>
                  {item.status}
                </span>
                <span className="font-bold text-gray-900">{item._count.status}</span>
              </div>
            ))}
            {!data?.ordersByStatus?.length && (
              <p className="text-gray-400 text-sm">No orders yet</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(data?.recentOrders || []).map((order: any) => (
              <div key={order.id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{order.orderNumber}</div>
                  <div className="text-xs text-gray-400">{order.customerName} · {order.deliveryCity}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</div>
                  <span className={`status-badge text-xs ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {!data?.recentOrders?.length && (
              <p className="text-gray-400 text-sm py-4 text-center">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-5">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Add Product', href: '/admin/products/new', icon: Package, color: 'bg-blue-50 text-blue-600' },
            { label: 'Manage Zones', href: '/admin/zones', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
            { label: 'View Orders', href: '/admin/orders', icon: ShoppingCart, color: 'bg-amber-50 text-amber-600' },
            { label: 'Reports', href: '/admin/reports', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
          ].map((action, i) => (
            <Link key={i} href={action.href} className={`p-4 rounded-xl ${action.color} hover:opacity-80 transition-opacity text-center`}>
              <action.icon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-semibold">{action.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
