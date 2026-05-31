// src/store/auth.ts
import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: string
  loyaltyPoints?: number
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('brickyard_user') || 'null')
    : null,
  token: typeof window !== 'undefined'
    ? localStorage.getItem('brickyard_token')
    : null,

  setAuth: (user, token) => {
    localStorage.setItem('brickyard_user', JSON.stringify(user))
    localStorage.setItem('brickyard_token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('brickyard_user')
    localStorage.removeItem('brickyard_token')
    set({ user: null, token: null })
  },

  isAdmin: () => {
    const { user } = get()
    return ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'LOGISTICS_MANAGER', 'ACCOUNTS'].includes(user?.role ?? '')
  },
}))
