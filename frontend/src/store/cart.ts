// src/store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  unit: string
  quantity: number
  unitPrice: number
  imageUrl?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateQty: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get()
        const existing = items.find(i => i.productId === item.productId)
        if (existing) {
          set({ items: items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i) })
        } else {
          set({ items: [...items, item] })
        }
      },

      updateQty: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({ items: get().items.map(i => i.productId === productId ? { ...i, quantity } : i) })
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: 'brickyard-cart' }
  )
)
