// src/components/layout/Footer.tsx
import Link from 'next/link'
import { Package, Phone, MapPin, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">BrickYard Pro</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Premium construction materials with transparent pricing and reliable delivery across the region.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              {['Solid Bricks', 'Hollow Blocks', 'Cement Bags', 'Sand & Aggregates', 'Pavers'].map(p => (
                <li key={p}><Link href="/products" className="hover:text-brand-400 transition-colors">{p}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Get a Quote', href: '/quote' },
                { label: 'Track Order', href: '/track' },
                { label: 'My Account', href: '/account' },
                { label: 'Admin Login', href: '/admin' },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className="hover:text-brand-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" /> 123 Industrial Area, Madanapalle, AP 517325</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-400" /> +91 9999999999</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-400" /> info@brickyardpro.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>© {new Date().getFullYear()} BrickYard Pro. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
