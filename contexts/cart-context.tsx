"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: string[]
    category?: {
      name: string
    }
  }
}

interface Cart {
  id: string
  items: CartItem[]
}

interface CartContextType {
  cart: Cart | null
  cartCount: number
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const { user, isSignedIn } = useUser()

  const cartCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0

  const fetchCart = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/cart?userId=${user.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setCart(data.cart)
      } else {
        console.error('Failed to fetch cart:', data.error)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId, quantity })
      })

      if (response.ok) {
        await fetchCart() // Refresh cart after adding
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity })
      })

      if (response.ok) {
        await fetchCart() // Refresh cart after updating
      } else {
        const data = await response.json()
        console.error('Failed to update cart:', data.error)
      }
    } catch (error) {
      console.error('Error updating cart:', error)
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    try {
      const response = await fetch(`/api/cart?cartItemId=${cartItemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCart() // Refresh cart after removing
      } else {
        const data = await response.json()
        console.error('Failed to remove from cart:', data.error)
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }

  const clearCart = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/cart?userId=${user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCart(null)
      } else {
        const data = await response.json()
        console.error('Failed to clear cart:', data.error)
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  const refreshCart = async () => {
    await fetchCart()
  }

  // Fetch cart when user changes or component mounts
  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [user?.id, isSignedIn])

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}