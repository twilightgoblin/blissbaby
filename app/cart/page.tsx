"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Minus, Plus, X, ShoppingBag, Tag, ArrowRight } from "lucide-react"

export default function CartPage() {
  // TODO: Replace with API call to fetch real cart items
  const [cartItems, setCartItems] = useState([])

  // TODO: Add useEffect to fetch real cart items from API
  useEffect(() => {
    // fetchCartItems().then(setCartItems)
  }, [])

  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)),
    )
  }

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const applyPromoCode = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = appliedPromo ? subtotal * 0.1 : 0
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal - discount + shipping

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 px-4 animate-scale-in">
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 animate-bounce-soft">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
              <p className="text-muted-foreground">Add some adorable products for your little one!</p>
            </div>
            <Button
              className="rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 hover:shadow-lg"
              size="lg"
              asChild
            >
              <Link href="/products">
                Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">{cartItems.length} items in your cart</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Cart Items */}
          <div className="space-y-4 stagger-fade-in">
            {cartItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden rounded-3xl border-border/60 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-muted/50 group">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              href={`/products/${item.id}`}
                              className="font-semibold hover:text-primary transition-colors text-balance"
                            >
                              {item.name}
                            </Link>
                            <Badge variant="secondary" className="mt-2 rounded-full text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-destructive/10 hover:text-destructive hover:scale-110 transition-all duration-300 -mr-2 -mt-1"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-transparent hover:scale-110 transition-all duration-300"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-transparent hover:scale-110 transition-all duration-300"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-lg font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6 animate-slide-in-right">
            <Card className="rounded-3xl border-border/60 sticky top-24 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-bold">Order Summary</h2>

                {/* Promo Code */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Promo Code</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="pl-10 rounded-full transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        disabled={!!appliedPromo}
                      />
                    </div>
                    <Button
                      onClick={applyPromoCode}
                      disabled={!!appliedPromo || !promoCode.trim()}
                      className="rounded-full bg-transparent hover:scale-105 transition-all duration-300"
                      variant="outline"
                    >
                      Apply
                    </Button>
                  </div>
                  {appliedPromo && (
                    <div className="flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-2 animate-scale-in">
                      <span className="text-sm font-medium text-primary">Code applied: {appliedPromo}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:text-destructive hover:scale-110 transition-all duration-300"
                        onClick={() => {
                          setAppliedPromo(null)
                          setPromoCode("")
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm animate-fade-in">
                      <span className="text-muted-foreground">Discount (10%)</span>
                      <span className="font-medium text-primary">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {subtotal < 50 && (
                    <p className="text-xs text-muted-foreground animate-pulse-soft">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 hover:scale-105 transition-all duration-300 hover:shadow-lg"
                  size="lg"
                  asChild
                >
                  <Link href="/checkout">
                    Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full rounded-full bg-transparent hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
