// src/components/admin/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import {
  LayoutDashboard, Package, ShoppingCart, MapPin, Truck,
  Users, BarChart3, Settings, LogOut, Package2, Wrench,
  ChevronRight
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Pricing', href: '/admin/pricing', icon: BarChart3 },
  { label: 'Delivery Zones', href: '/admin/zones', icon: MapPin },
  { label: 'Vehicles', href: '/admin/vehicles', icon: Truck },
  { label: 'Labour Settings', href: '/admin/labour', icon: Wrench },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  return (
    <aside className="bg-gray-900 text-white flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Package2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm">BrickYard Pro</div>
            <div className="text-xs text-gray-500">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {NAV.map(item => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <Link href="/" className="admin-sidebar-link text-xs">
          <ChevronRight className="w-3 h-3 rotate-180" /> View Store
        </Link>
        <button
          onClick={logout}
          className="admin-sidebar-link w-full text-red-400 hover:bg-red-900/20 hover:text-red-300 text-xs"
        >
          <LogOut className="w-3 h-3" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
