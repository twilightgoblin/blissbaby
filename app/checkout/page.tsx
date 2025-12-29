"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { CreditCard, Lock, Package, CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import StripeCheckoutForm from "./stripe-checkout-form"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  
  const [step, setStep] = useState<"checkout" | "success">("checkout")
  const [clientSecret, setClientSecret] = useState<string>("")
  const [paymentIntentId, setPaymentIntentId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string>("")

  // Calculate totals
  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0
  const shipping = 0 // Free shipping
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  // Create payment intent when component mounts
  useEffect(() => {
    if (cart?.items?.length && total > 0) {
      createPaymentIntent()
    }
  }, [cart, total])

  const createPaymentIntent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          metadata: {
            userId: user?.id || 'guest',
            cartId: cart?.id || 'guest-cart',
            itemCount: cart?.items?.length || 0,
            isGuest: !isAuthenticated
          }
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setClientSecret(data.clientSecret)
        setPaymentIntentId(data.paymentIntentId)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to initialize payment",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      toast({
        title: "Error",
        description: "Failed to initialize payment",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    // Generate order number
    const orderNum = `BB-${Math.floor(Math.random() * 100000)}`
    setOrderNumber(orderNum)
    
    // Clear cart after successful payment
    await clearCart()
    
    // Show success step
    setStep("success")
    
    toast({
      title: "Payment Successful!",
      description: `Your order ${orderNum} has been confirmed.`,
    })
  }

  // Show loading if auth is still loading or processing payment
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Show empty cart message
  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">Add some items to your cart to proceed with checkout.</p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container mx-auto px-4 py-16">
            <Card className="max-w-2xl mx-auto rounded-3xl border-border/60 overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Order Confirmed!</h1>
                  <p className="text-muted-foreground">Thank you for your purchase. Your order has been received.</p>
                </div>
                <Card className="rounded-2xl border-border/60 bg-muted/20">
                  <CardContent className="p-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order Number</span>
                      <span className="font-medium">{orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-bold text-primary">₹{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment ID</span>
                      <span className="font-medium text-xs">{paymentIntentId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Delivery</span>
                      <span className="font-medium">3-5 business days</span>
                    </div>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground">
                  We've sent a confirmation email with your order details and tracking information.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="rounded-full bg-primary hover:bg-primary/90" asChild>
                    <Link href="/orders">View Order History</Link>
                  </Button>
                  <Button variant="outline" className="rounded-full bg-transparent" asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Checkout</h1>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Secure checkout powered by Stripe</span>
          </div>
          {!isAuthenticated && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/60">
              <p className="text-sm text-muted-foreground">
                Checking out as a guest. 
                <Link href="/auth/login?redirect=/checkout" className="ml-1 text-primary hover:underline">
                  Sign in
                </Link> 
                {" "}or{" "}
                <Link href="/auth/signup?redirect=/checkout" className="text-primary hover:underline">
                  create an account
                </Link> 
                {" "}to save your information and track orders.
              </p>
            </div>
          )}
          {isAuthenticated && user && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-primary">
                Welcome back, {user.name || user.email}! Your order will be saved to your account.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Checkout Form */}
          <div className="space-y-6">
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutForm 
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  total={total}
                />
              </Elements>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="rounded-3xl border-border/60 sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted/50">
                        <img
                          src={item.product.images?.[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.category?.name}</p>
                        <p className="text-sm font-bold text-primary">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-primary">Free</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
