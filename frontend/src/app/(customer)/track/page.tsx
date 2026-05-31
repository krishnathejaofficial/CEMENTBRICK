// src/app/(customer)/track/page.tsx
'use client'

import { useState, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Search, Package, Truck, CheckCircle, Clock, XCircle, Factory } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock, color: 'text-gray-400' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500' },
  { key: 'MANUFACTURING', label: 'Manufacturing', icon: Factory, color: 'text-amber-500' },
  { key: 'DISPATCHED', label: 'Dispatched', icon: Truck, color: 'text-purple-500' },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle, color: 'text-green-500' },
]

function Track() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('order') || '')

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['track', orderNumber],
    queryFn: () => ordersApi.track(orderNumber).then(r => r.data),
    enabled: !!orderNumber,
  })

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : -1

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <h1 className="section-title text-center mb-2">Track Your Order</h1>
          <p className="section-subtitle text-center mb-10">Enter your order number to see real-time status</p>

          {/* Search */}
          <div className="card p-6 mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="e.g. BY-2024-12345"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && setOrderNumber(searchTerm)}
              />
              <button
                onClick={() => setOrderNumber(searchTerm)}
                className="btn-primary px-6"
              >
                <Search className="w-4 h-4" /> Track
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="card p-12 text-center">
              <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Fetching order details...</p>
            </div>
          )}

          {isError && (
            <div className="card p-12 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="font-semibold text-gray-800">Order not found</p>
              <p className="text-gray-400 text-sm mt-1">Check the order number and try again</p>
            </div>
          )}

          {order && (
            <div className="space-y-6">
              {/* Order summary */}
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Order Number</div>
                    <div className="font-display text-2xl font-bold text-gray-900">{order.orderNumber}</div>
                  </div>
                  <div className={`status-badge ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    order.status === 'DISPATCHED' ? 'bg-purple-100 text-purple-700' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs mb-0.5">Customer</div>
                    <div className="font-medium">{order.customerName}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-0.5">Total Amount</div>
                    <div className="font-bold text-brand-600 text-lg">₹{order.totalAmount?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-0.5">Delivery To</div>
                    <div className="font-medium">{order.deliveryCity}, {order.deliveryPincode}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-0.5">Placed On</div>
                    <div className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
              </div>

              {/* Status timeline */}
              {order.status !== 'CANCELLED' && (
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-800 mb-6">Order Progress</h3>
                  <div className="space-y-0">
                    {STATUS_STEPS.map((step, i) => {
                      const isPast = i <= currentStepIndex
                      const isCurrent = i === currentStepIndex
                      const Icon = step.icon
                      return (
                        <div key={step.key} className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                              isPast ? 'bg-brand-600 border-brand-600' : 'bg-white border-gray-200'
                            } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}>
                              <Icon className={`w-5 h-5 ${isPast ? 'text-white' : 'text-gray-300'}`} />
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`w-0.5 h-12 ${isPast && i < currentStepIndex ? 'bg-brand-600' : 'bg-gray-200'}`} />
                            )}
                          </div>
                          <div className="pt-2 pb-8">
                            <div className={`font-semibold ${isPast ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</div>
                            {isCurrent && (
                              <div className="text-xs text-brand-600 font-medium mt-0.5">Current Status</div>
                            )}
                            {order.statusHistory?.find((h: any) => h.status === step.key)?.note && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {order.statusHistory.find((h: any) => h.status === step.key).note}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {(order.items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-earth-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-earth-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{item.productName}</div>
                          <div className="text-xs text-gray-400">{item.quantity.toLocaleString()} {item.unit}s × ₹{item.unitPrice}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-sm">₹{item.subtotal.toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                {/* Price summary */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Materials</span><span>₹{order.materialCost?.toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Transport</span><span>₹{order.transportCost?.toLocaleString()}</span></div>
                  {order.labourCost > 0 && <div className="flex justify-between text-gray-500"><span>Labour</span><span>₹{order.labourCost?.toLocaleString()}</span></div>}
                  {order.labourFoodCost > 0 && <div className="flex justify-between text-gray-500"><span>Labour Food</span><span>₹{order.labourFoodCost?.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-gray-500"><span>GST</span><span>₹{order.gstAmount?.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200">
                    <span>Total</span><span className="text-brand-600">₹{order.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Track />
    </Suspense>
  )
}
