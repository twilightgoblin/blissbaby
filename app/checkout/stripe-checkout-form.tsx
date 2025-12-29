"use client"

import React, { useState, useEffect } from 'react'
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { CreditCard, Lock, Package, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface StripeCheckoutFormProps {
  clientSecret: string
  onSuccess: () => void
  total: number
}

export default function StripeCheckoutForm({ 
  clientSecret, 
  onSuccess, 
  total 
}: StripeCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: ''
  })

  // Update email when user changes (for authenticated users)
  useEffect(() => {
    if (user?.email && !shippingInfo.email) {
      setShippingInfo(prev => ({
        ...prev,
        email: user.email
      }))
    }
  }, [user?.email, shippingInfo.email])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      // Validate required fields
      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || !shippingInfo.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required shipping information",
          variant: "destructive"
        })
        setIsProcessing(false)
        return
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
          receipt_email: shippingInfo.email,
        },
        redirect: 'if_required'
      })

      if (error) {
        console.error('Payment failed:', error)
        
        // More detailed error handling
        let errorMessage = "An error occurred during payment"
        
        if (error.type === 'card_error') {
          errorMessage = error.message || "Your card was declined"
        } else if (error.type === 'validation_error') {
          errorMessage = "Please check your payment information"
        } else if (error.message) {
          errorMessage = error.message
        }
        
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive"
        })
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent)
        onSuccess()
      } else {
        console.log('Payment status:', paymentIntent?.status)
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed. Please wait...",
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Information */}
      <Card className="rounded-3xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                placeholder="John" 
                required 
                className="rounded-full"
                value={shippingInfo.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Doe" 
                required 
                className="rounded-full"
                value={shippingInfo.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="john@example.com" 
              required 
              className="rounded-full"
              value={shippingInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!!user?.email} // Disable if user is logged in
            />
            {user?.email && (
              <p className="text-xs text-muted-foreground">
                Using your account email. <Link href="/auth/login" className="text-primary hover:underline">Not you?</Link>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+1 (555) 000-0000" 
              required 
              className="rounded-full"
              value={shippingInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
          
          {/* Shipping Address */}
          <div className="space-y-2">
            <Label>Shipping Address</Label>
            <div className="rounded-2xl border border-border/60 p-4">
              <AddressElement 
                options={{
                  mode: 'shipping',
                  allowedCountries: ['IN'],
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="rounded-3xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border/60 p-4">
            <PaymentElement 
              options={{
                layout: 'tabs'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card className="rounded-3xl border-border/60">
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAsShipping"
              checked={sameAsShipping}
              onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
            />
            <label
              htmlFor="sameAsShipping"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Same as shipping address
            </label>
          </div>
          
          {!sameAsShipping && (
            <div className="rounded-2xl border border-border/60 p-4">
              <AddressElement 
                options={{
                  mode: 'billing',
                  allowedCountries: ['IN'],
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full rounded-full bg-primary hover:bg-primary/90 h-12" 
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay ₹{total.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment information is secure and encrypted by Stripe
      </p>
    </form>
  )
}