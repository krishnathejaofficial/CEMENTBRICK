// src/app/(customer)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Package, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)
  const [isRegister, setIsRegister] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = isRegister
        ? await authApi.register(form)
        : await authApi.login({ email: form.email, password: form.password })
      setAuth(res.data.user, res.data.token)
      router.push(res.data.user.role !== 'CUSTOMER' ? '/admin' : '/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900">BrickYard <span className="text-brand-600">Pro</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-900">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-gray-500 mt-2">{isRegister ? 'Join us to track orders and save addresses' : 'Sign in to your account'}</p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1.5">Full Name</label>
                  <input name="name" className="input-field" placeholder="Your name" value={form.name} onChange={handle} required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1.5">Phone Number</label>
                  <input name="phone" className="input-field" placeholder="+91 9999999999" value={form.phone} onChange={handle} />
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Email Address</label>
              <input name="email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={handle} required />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" value={form.password} onChange={handle} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsRegister(!isRegister)} className="text-brand-600 font-semibold hover:underline">
              {isRegister ? 'Sign In' : 'Register Free'}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
