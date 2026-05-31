// src/app/(customer)/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Package, Truck, Users, Star, ChevronDown, Phone, MessageCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productsApi, categoriesApi } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PriceEstimatorWidget } from '@/components/customer/PriceEstimatorWidget'
import { ProductCard } from '@/components/customer/ProductCard'

const STATS = [
  { label: 'Bricks Delivered', value: '5,000,000+', icon: Package },
  { label: 'Projects Completed', value: '1,200+', icon: Star },
  { label: 'Happy Customers', value: '3,500+', icon: Users },
  { label: 'Cities Served', value: '50+', icon: Truck },
]

export default function HomePage() {
  const { data: productsData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.list({ featured: 'true', limit: 8 }).then(r => r.data),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then(r => r.data),
  })

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hero-gradient relative min-h-screen flex items-center overflow-hidden">
        {/* Brick pattern overlay */}
        <div className="absolute inset-0 brick-texture opacity-30" />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

        <div className="relative z-10 container mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block bg-brand-500/20 border border-brand-400/40 text-brand-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                Premium Construction Materials
              </span>

              <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                Built on{' '}
                <span className="text-brand-400">Quality.</span>
                <br />
                Priced with
                <span className="text-brand-400"> Clarity.</span>
              </h1>

              <p className="text-xl text-white/80 mb-10 font-body leading-relaxed max-w-xl">
                From foundation bricks to cement bags — order with instant price calculation including delivery and labour. No hidden costs.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/quote" className="btn-primary text-lg px-8 py-4 bg-brand-500 hover:bg-brand-600 shadow-xl shadow-brand-900/30">
                  Get Instant Quote <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/products" className="btn-secondary border-white/40 text-white hover:bg-white/10 text-lg px-8 py-4">
                  Browse Products
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Price estimator widget — floating card */}
          <motion.div
            className="absolute right-8 top-1/2 -translate-y-1/2 w-full max-w-sm hidden xl:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <PriceEstimatorWidget />
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="w-8 h-8 text-white/50" />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="bg-earth-800 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <stat.icon className="w-8 h-8 text-brand-400 mx-auto mb-3" />
                <div className="font-display text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-earth-300 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile price estimator ─────────────────────── */}
      <section className="xl:hidden bg-brand-50 py-12">
        <div className="container mx-auto px-6">
          <h2 className="section-title text-center mb-8">Get an Instant Quote</h2>
          <PriceEstimatorWidget />
        </div>
      </section>

      {/* ── Categories ────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="section-title">What We Supply</h2>
            <p className="section-subtitle">Everything your construction project needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(categories || []).map((cat: any, i: number) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="block p-6 rounded-2xl border-2 border-gray-100 hover:border-brand-300 hover:bg-brand-50 text-center transition-all duration-200 group"
                >
                  <div className="w-12 h-12 bg-brand-100 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                    <Package className="w-6 h-6 text-brand-600" />
                  </div>
                  <div className="font-semibold text-gray-800 text-sm">{cat.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{cat._count?.products || 0} products</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title">Popular Products</h2>
              <p className="section-subtitle">Our most ordered construction materials</p>
            </div>
            <Link href="/products" className="btn-ghost text-brand-600">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(productsData?.products || []).map((product: any, i: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="section-title">Why BrickYard Pro?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '💯', title: 'Transparent Pricing', desc: 'See material + delivery + labour cost before placing your order. No surprises.' },
              { icon: '🚛', title: 'Fast Delivery', desc: 'Fleet of vehicles from Tata Ace to 10-wheelers. Optimal vehicle auto-selected for your load.' },
              { icon: '📍', title: 'Zone-Based Rates', desc: 'Fixed flat rates for nearby areas. Precise per-km calculation for distant locations.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="card p-8 text-center hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-display text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 brick-texture opacity-20" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to Start Building?</h2>
          <p className="text-white/80 text-xl mb-8">Get your materials delivered to your site with full price transparency.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/quote" className="btn-primary text-lg px-8 py-4 bg-white text-brand-700 hover:bg-brand-50">
              Build Your Quote <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary border-white/50 text-white hover:bg-white/10 text-lg px-8 py-4"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
