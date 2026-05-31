// src/app/(customer)/quote/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { productsApi, pricingApi, ordersApi } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useCartStore } from '@/store/cart'
import {
  ArrowLeft, ArrowRight, Check, Loader2, Package,
  MapPin, Truck, User, AlertCircle, ShoppingBag, Phone
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const STEPS = ['Products', 'Location', 'Options', 'Review & Order']

export default function QuotePage() {
  const router = useRouter()
  const cart = useCartStore()
  const [step, setStep] = useState(0)
  const [delivery, setDelivery] = useState({ line1: '', city: '', pincode: '', lat: 0, lng: 0 })
  const [options, setOptions] = useState({ includeLabour: false, includeLabourFood: false })
  const [customer, setCustomer] = useState({ customerName: '', customerPhone: '', customerEmail: '', notes: '' })
  const [estimate, setEstimate] = useState<any>(null)
  const [stepError, setStepError] = useState<string | null>(null)

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
    onSuccess: res => { setEstimate(res.data); setStepError(null) },
    onError: (err: any) => {
      setStepError(err?.response?.data?.error || 'Could not calculate price. Please check your PIN code and try again.')
    },
  })

  const placeOrder = useMutation({
    mutationFn: () => ordersApi.create({
      items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      delivery,
      options,
      customerName: customer.customerName,
      customerPhone: customer.customerPhone,
      customerEmail: customer.customerEmail,
      notes: customer.notes,
    }),
    onSuccess: (res) => {
      cart.clearCart()
      router.push(`/track?order=${res.data.order.orderNumber}`)
    },
    onError: (err: any) => {
      setStepError(err?.response?.data?.error || 'Failed to place order. Please try again.')
    },
  })

  const nextStep = async () => {
    setStepError(null)

    // Validate step 0: must have items
    if (step === 0 && cart.items.length === 0) {
      setStepError('Please select at least one product to continue.')
      return
    }

    // Validate step 1: must have pincode
    if (step === 1) {
      if (!delivery.pincode || delivery.pincode.length < 6) {
        setStepError('Please enter a valid 6-digit PIN code to continue.')
        return
      }
    }

    // Step 2: Calculate price before moving to review
    if (step === 2) {
      try {
        await estimateMutation.mutateAsync()
      } catch {
        return // Error is shown by onError handler above
      }
    }

    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const stepIcons = [Package, MapPin, Truck, User]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6 max-w-3xl">
          <h1 className="section-title text-center mb-2">Build Your Quote</h1>
          <p className="text-center text-gray-400 text-sm mb-8">
            Select materials → Enter address → Get instant price → Place order — no account needed
          </p>

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
                <h2 className="font-display text-2xl font-bold mb-2">Select Products</h2>
                <p className="text-gray-400 text-sm mb-6">Choose what materials you need and adjust quantities</p>
                <div className="space-y-3">
                  {(products || []).map((p: any) => {
                    const inCart = cart.items.find(i => i.productId === p.id)
                    return (
                      <div key={p.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${inCart ? 'border-brand-300 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <Package className="w-8 h-8 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{p.name}</div>
                          <div className="text-xs text-gray-400">₹{p.basePrice}/{p.unit} · {p.category?.name}</div>
                        </div>
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => cart.updateQty(p.id, Math.max(100, inCart.quantity - 100))}
                              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold"
                            >-</button>
                            <input
                              type="number"
                              value={inCart.quantity}
                              onChange={e => cart.updateQty(p.id, parseInt(e.target.value) || 0)}
                              className="w-20 text-center border border-gray-200 rounded-lg py-1 text-sm"
                            />
                            <button
                              onClick={() => cart.updateQty(p.id, inCart.quantity + 100)}
                              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold"
                            >+</button>
                            <button onClick={() => cart.removeItem(p.id)} className="text-red-400 hover:text-red-600 text-xs ml-1">Remove</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => cart.addItem({ productId: p.id, name: p.name, unit: p.unit, quantity: 1000, unitPrice: p.basePrice })}
                            className="btn-primary text-xs px-3 py-1.5"
                          >
                            <ShoppingBag className="w-3 h-3" /> Add
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Cart summary */}
                {cart.items.length > 0 && (
                  <div className="mt-4 p-4 bg-brand-50 rounded-xl border border-brand-200 text-sm">
                    <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-brand-600" /> Cart Summary
                    </div>
                    {cart.items.map(item => (
                      <div key={item.productId} className="flex justify-between text-gray-600 py-0.5">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.quantity.toLocaleString()} {item.unit}s</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Delivery Location</h2>
                <p className="text-gray-400 text-sm mb-6">Your PIN code is used to calculate delivery charges accurately</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1.5">Address Line 1</label>
                    <input
                      className="input-field"
                      placeholder="Door/Plot No., Street, Area"
                      value={delivery.line1}
                      onChange={e => setDelivery({ ...delivery, line1: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1.5">City / Village</label>
                    <input
                      className="input-field"
                      placeholder="City or village name"
                      value={delivery.city}
                      onChange={e => setDelivery({ ...delivery, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="input-field"
                      placeholder="6-digit PIN code (e.g. 517325)"
                      maxLength={6}
                      value={delivery.pincode}
                      onChange={e => {
                        setStepError(null)
                        setDelivery({ ...delivery, pincode: e.target.value.replace(/\D/g, '') })
                      }}
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      We deliver to Madanapalle and surrounding areas within 50 km
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Labour options */}
            {step === 2 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Labour & Delivery Options</h2>
                <p className="text-gray-400 text-sm mb-6">Optionally include loading/unloading labour at your site</p>
                <div className="space-y-4">
                  <div
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${options.includeLabour ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setOptions({ ...options, includeLabour: !options.includeLabour })}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${options.includeLabour ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`}>
                        {options.includeLabour && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <div className="font-semibold">Include Labour</div>
                        <div className="text-sm text-gray-500">Loading & unloading workers at your construction site</div>
                      </div>
                    </div>
                  </div>

                  {options.includeLabour && (
                    <div
                      className={`ml-8 p-5 rounded-xl border-2 cursor-pointer transition-all ${options.includeLabourFood ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setOptions({ ...options, includeLabourFood: !options.includeLabourFood })}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${options.includeLabourFood ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`}>
                          {options.includeLabourFood && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <div className="font-semibold">Include Labour Food</div>
                          <div className="text-sm text-gray-500">Meal allowance for labourers (₹150/person/day)</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    <div className="font-semibold mb-1">ℹ️ Click "Calculate Price" to get final quote</div>
                    <div className="text-xs">Price is calculated based on your PIN code, vehicle type, distance, and labour preferences.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Review & Place Order</h2>

                {/* Price Breakdown */}
                {estimate && (
                  <div className="bg-brand-50 rounded-xl p-5 mb-6 border border-brand-200">
                    <div className="font-semibold text-gray-900 mb-3">💰 Price Breakdown</div>
                    {Object.entries(estimate.breakdown as Record<string, string>).map(([k, v]) => (
                      <div key={k} className={`flex justify-between text-sm py-1.5 ${k === 'total' ? 'font-bold text-lg border-t border-brand-200 mt-2 pt-2' : 'text-gray-600'}`}>
                        <span className="capitalize">{k}</span>
                        <span className={k === 'total' ? 'text-brand-700' : ''}>{v as string}</span>
                      </div>
                    ))}
                    {estimate.vehicleType && (
                      <div className="mt-3 text-xs text-gray-400 flex items-center gap-1.5">
                        <Truck className="w-3 h-3" /> Estimated vehicle: {estimate.vehicleType}
                      </div>
                    )}
                  </div>
                )}

                {/* Items summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
                  <div className="font-semibold text-gray-700 mb-2">Order Items</div>
                  {cart.items.map(item => (
                    <div key={item.productId} className="flex justify-between py-1 text-gray-600">
                      <span>{item.name}</span>
                      <span>{item.quantity.toLocaleString()} {item.unit}s × ₹{item.unitPrice}</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                    📍 Delivery to: {delivery.line1 ? `${delivery.line1}, ` : ''}{delivery.city ? `${delivery.city} - ` : ''}{delivery.pincode}
                  </div>
                </div>

                {/* Customer details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Your Contact Details</h3>
                  <p className="text-xs text-gray-400">No account needed — just enter your details to complete the order</p>
                  <input
                    className="input-field"
                    placeholder="Full Name *"
                    value={customer.customerName}
                    onChange={e => setCustomer({ ...customer, customerName: e.target.value })}
                    required
                  />
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className="input-field pl-10"
                      placeholder="Phone Number * (e.g. 9876543210)"
                      value={customer.customerPhone}
                      onChange={e => setCustomer({ ...customer, customerPhone: e.target.value.replace(/\D/g, '') })}
                      maxLength={10}
                      required
                    />
                  </div>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="Email (optional — for order confirmation)"
                    value={customer.customerEmail}
                    onChange={e => setCustomer({ ...customer, customerEmail: e.target.value })}
                  />
                  <textarea
                    className="input-field min-h-20"
                    placeholder="Any special delivery instructions or site notes..."
                    value={customer.notes}
                    onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Error message */}
            {stepError && (
              <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{stepError}</span>
              </div>
            )}

            {/* Order error from mutation */}
            {placeOrder.isError && (
              <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{(placeOrder.error as any)?.response?.data?.error || 'Failed to place order. Please try again.'}</span>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => { setStep(s => s - 1); setStepError(null) }} className="btn-ghost border border-gray-200 flex-1">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="btn-primary flex-1 justify-center"
                  disabled={estimateMutation.isPending}
                >
                  {estimateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {step === 2 ? 'Calculate Price' : 'Next'} {!estimateMutation.isPending && <ArrowRight className="w-4 h-4" />}
                </button>
              ) : (
                <button
                  onClick={() => placeOrder.mutate()}
                  className="btn-primary flex-1 justify-center bg-green-600 hover:bg-green-700"
                  disabled={placeOrder.isPending || !customer.customerName || !customer.customerPhone || customer.customerPhone.length < 10}
                >
                  {placeOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {placeOrder.isPending ? 'Placing Order...' : 'Confirm & Place Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
