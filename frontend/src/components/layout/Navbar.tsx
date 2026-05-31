// src/components/layout/Navbar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X, User, Package } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const totalItems = useCartStore(s => s.totalItems())
  const { user, logout } = useAuthStore()

  const navLinks = [
    { label: 'Products', href: '/products' },
    { label: 'Quote Builder', href: '/quote' },
    { label: 'Track Order', href: '/track' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">BrickYard<span className="text-brand-600"> Pro</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="btn-ghost text-sm">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link href="/quote" className="relative p-2 hover:bg-brand-50 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 btn-ghost text-sm">
                  <User className="w-4 h-4" /> {user.name.split(' ')[0]}
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50">My Orders</Link>
                  {useAuthStore.getState().isAdmin() && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-brand-600 hover:bg-brand-50 font-semibold">Admin Panel</Link>
                  )}
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm px-4 py-2">Login</Link>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="block btn-ghost" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
