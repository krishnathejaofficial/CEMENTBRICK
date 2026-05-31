// src/app/(customer)/quote/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { productsApi, pricingApi, ordersApi } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { useCartStore } from '@/store/cart'
import { ArrowLeft, ArrowRight, Check, Loader2, Package, MapPin, Truck, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

const STEPS = ['Products', 'Location', 'Options', 'Review & Order']

export default function QuotePage() {
  const router = useRouter()
  const cart = useCartStore()
  const [step, setStep] = useState(0)
  const [delivery, setDelivery] = useState({ line1: '', city: '', pincode: '', lat: 0, lng: 0 })
  const [options, setOptions] = useState({ includeLabour: false, includeLabourFood: false })
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', notes: '' })
  const [estimate, setEstimate] = useState<any>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  const { data: products } = useQuery({
    queryKey: ['all-products'],
    queryFn: () => productsApi.list({ limit: 100 }).then(r => r.data.products),
  })

  const estimateMutation = useMutation({
    mutationFn: () => pricingApi.estimate({
      items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      delivery: { pincode: delivery.pincode, line1: delivery.line1, city: delivery.city },
      options,
    }),
    onSuccess: res => setEstimate(res.data),
  })

  const placeOrder = useMutation({
    mutationFn: () => ordersApi.create({
      items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      delivery,
      options,
      ...customer,
    }),
    onSuccess: (res) => {
      cart.clearCart()
      router.push(`/track?order=${res.data.order.orderNumber}`)
    },
  })

  const nextStep = async () => {
    if (step === 2) await estimateMutation.mutateAsync()
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const stepIcons = [Package, MapPin, Truck, User]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6 max-w-3xl">
          <h1 className="section-title text-center mb-8">Build Your Quote</h1>

          {/* Step indicators */}
          <div className="flex items-center justify-between mb-10">
            {STEPS.map((label, i) => {
              const Icon = stepIcons[i]
              return (
                <div key={i} className="flex items-center flex-1">
                  <div className={`flex items-center gap-2 ${i <= step ? 'text-brand-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i < step ? 'bg-brand-600 text-white' :
                      i === step ? 'border-2 border-brand-600 text-brand-600' :
                      'border-2 border-gray-200 text-gray-400'
                    }`}>
                      {i < step ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-brand-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>

          <div className="card p-8">
            {/* Step 0: Products */}
            {step === 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Select Products</h2>
                <div className="space-y-3">
                  {(products || []).map((p: any) => {
                    const inCart = cart.items.find(i => i.productId === p.id)
                    return (
                      <div key={p.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${inCart ? 'border-brand-300 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <Package className="w-8 h-8 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{p.name}</div>
                          <div className="text-xs text-gray-400">₹{p.basePrice}/{p.unit}</div>
                        </div>
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => cart.updateQty(p.id, inCart.quantity - 100)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold">-</button>
                            <input
                              type="number"
                              value={inCart.quantity}
                              onChange={e => cart.updateQty(p.id, parseInt(e.target.value) || 0)}
                              className="w-20 text-center border border-gray-200 rounded-lg py-1 text-sm"
                            />
                            <button onClick={() => cart.updateQty(p.id, inCart.quantity + 100)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold">+</button>
                            <button onClick={() => cart.removeItem(p.id)} className="text-red-400 hover:text-red-600 text-xs ml-1">Remove</button>
                          </div>
                        ) : (
                          <button onClick={() => cart.addItem({ productId: p.id, name: p.name, unit: p.unit, quantity: 1000, unitPrice: p.basePrice })}
                            className="btn-primary text-xs px-3 py-1.5">
                            + Add
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Delivery Location</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1.5">Address Line 1</label>
                    <input className="input-field" placeholder="Door/Plot No., Street" value={delivery.line1} onChange={e => setDelivery({ ...delivery, line1: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1.5">City/Village</label>
                    <input className="input-field" placeholder="City or village name" value={delivery.city} onChange={e => setDelivery({ ...delivery, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1.5">PIN Code *</label>
                    <input className="input-field" placeholder="6-digit PIN code" maxLength={6} value={delivery.pincode} onChange={e => setDelivery({ ...delivery, pincode: e.target.value.replace(/\D/g, '') })} required />
                    <p className="text-xs text-gray-400 mt-1">Used to calculate delivery charges</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Labour options */}
            {step === 2 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Labour & Delivery Options</h2>
                <div className="space-y-4">
                  <div className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${options.includeLabour ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setOptions({ ...options, includeLabour: !options.includeLabour })}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${options.includeLabour ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`}>
                        {options.includeLabour && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <div className="font-semibold">Include Labour</div>
                        <div className="text-sm text-gray-500">Loading & unloading at your site</div>
                      </div>
                    </div>
                  </div>

                  {options.includeLabour && (
                    <div className={`ml-8 p-5 rounded-xl border-2 cursor-pointer transition-all ${options.includeLabourFood ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setOptions({ ...options, includeLabourFood: !options.includeLabourFood })}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${options.includeLabourFood ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`}>
                          {options.includeLabourFood && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <div className="font-semibold">Include Labour Food</div>
                          <div className="text-sm text-gray-500">Meal allowance for labourers (₹150/person)</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Review & Place Order</h2>
                {estimate && (
                  <div className="bg-brand-50 rounded-xl p-5 mb-6 border border-brand-200">
                    <div className="font-semibold text-gray-900 mb-3">Price Breakdown</div>
                    {Object.entries(estimate.breakdown as Record<string, string>).map(([k, v]) => (
                      <div key={k} className={`flex justify-between text-sm py-1 ${k === 'total' ? 'font-bold text-lg border-t border-brand-200 mt-1 pt-2' : 'text-gray-600'}`}>
                        <span className="capitalize">{k}</span>
                        <span className={k === 'total' ? 'text-brand-700' : ''}>{v as string}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Your Contact Details</h3>
                  <input className="input-field" placeholder="Full Name *" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} required />
                  <input className="input-field" placeholder="Phone Number *" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} required />
                  <input className="input-field" type="email" placeholder="Email (optional)" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} />
                  <textarea className="input-field min-h-20" placeholder="Delivery instructions or notes..." value={customer.notes} onChange={e => setCustomer({ ...customer, notes: e.target.value })} />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-ghost border border-gray-200 flex-1">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="btn-primary flex-1 justify-center"
                  disabled={step === 0 && cart.items.length === 0 || estimateMutation.isPending}
                >
                  {estimateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {step === 2 ? 'Calculate Price' : 'Next'} <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => placeOrder.mutate()}
                  className="btn-primary flex-1 justify-center bg-green-600 hover:bg-green-700"
                  disabled={placeOrder.isPending || !customer.name || !customer.phone}
                >
                  {placeOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Place Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
