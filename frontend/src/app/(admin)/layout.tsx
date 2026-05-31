// src/app/(admin)/layout.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAdmin } = useAuthStore()

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (!isAdmin()) { router.push('/'); return }
  }, [user])

  if (!user || !isAdmin()) return null

  return (
    <div className="admin-layout bg-gray-50 min-h-screen">
      <AdminSidebar />
      <main className="overflow-auto">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
