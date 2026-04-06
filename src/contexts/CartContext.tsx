import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Product } from '@/data/products'

export interface CartItem {
  product: Product
  quantity: number
  tierId: number // index into product.tiers
  price: number
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: Product, tierId?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  fees: number
  total: number
}

const CartContext = createContext<CartContextType | null>(null)
const CART_KEY = 'bth_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback((product: Product, tierId = 0) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.tierId === tierId)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.tierId === tierId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      const tier = product.tiers[tierId]
      return [...prev, { product, quantity: 1, tierId, price: tier?.price ?? product.price }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId))
    } else {
      setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i))
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const fees = Math.round(subtotal * 0.025) // 2.5% processing fee
  const total = subtotal + fees

  return (
    <CartContext.Provider value={{ items, isOpen, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, fees, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
