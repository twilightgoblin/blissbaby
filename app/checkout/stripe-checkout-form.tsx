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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Lock, Package, Loader2, MapPin, User } from 'lucide-react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface SavedAddress {
  id: string
  type: string
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

interface StripeCheckoutFormProps {
  clientSecret: string
  onSuccess: (paymentIntentId: string, shippingInfo: any, addressData: any) => void
  total: number
}

export default function StripeCheckoutForm({ 
  clientSecret, 
  onSuccess, 
  total 
}: StripeCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null)
  const [addressData, setAddressData] = useState({
    shippingAddress: null,
    billingAddress: null
  })
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || '',
    phone: ''
  })

  // Update email and name when user changes (for authenticated users)
  useEffect(() => {
    const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress
    if (user && (!shippingInfo.email || !shippingInfo.firstName)) {
      setShippingInfo(prev => ({
        ...prev,
        email: userEmail || prev.email,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
      }))
    }
  }, [user, shippingInfo.email, shippingInfo.firstName])

  // Fetch saved addresses when user is available
  useEffect(() => {
    if (user) {
      fetchSavedAddresses()
    }
  }, [user])

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true)
      const response = await fetch('/api/user/addresses')
      if (response.ok) {
        const data = await response.json()
        setSavedAddresses(data.addresses || [])
        
        // Auto-fill with default address if available
        const defaultAddress = data.addresses?.find((addr: SavedAddress) => addr.isDefault)
        if (defaultAddress && !shippingInfo.firstName) {
          autofillFromAddress(defaultAddress)
        }
      }
    } catch (error) {
      console.error('Error fetching saved addresses:', error)
    } finally {
      setLoadingAddresses(false)
    }
  }

  const autofillFromAddress = (address: SavedAddress) => {
    setShippingInfo(prev => ({
      ...prev,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone || prev.phone
    }))
    
    // Store the selected address for order creation
    const addressForOrder = {
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || ''
    }
    
    setAddressData(prev => ({
      ...prev,
      shippingAddress: addressForOrder,
      billingAddress: sameAsShipping ? addressForOrder : prev.billingAddress
    }))
    
    setSelectedAddress(address)
    
    toast({
      title: "Address Auto-filled",
      description: `Using your saved address: ${address.firstName} ${address.lastName}`,
    })
  }

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

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isValidEmail = emailRegex.test(shippingInfo.email.trim())
      
      if (!isValidEmail) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive"
        })
        setIsProcessing(false)
        return
      }

      console.log('Payment confirmation with email:', shippingInfo.email)

      // Prepare confirm params - only include receipt_email if valid
      const confirmParams: any = {
        return_url: `${window.location.origin}/checkout`,
      }
      
      if (isValidEmail) {
        confirmParams.receipt_email = shippingInfo.email.trim()
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams,
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
        
        // Get address data from Stripe Elements or use pre-filled data
        const addressElement = elements.getElement('address')
        let shippingAddress = addressData.shippingAddress // Use pre-filled address if available
        let billingAddress = addressData.billingAddress
        
        // If no pre-filled address, try to get from Stripe Elements
        if (!shippingAddress && addressElement) {
          const addressValue = await addressElement.getValue()
          if (addressValue.complete) {
            shippingAddress = {
              firstName: shippingInfo.firstName,
              lastName: shippingInfo.lastName,
              company: '', // Company field not collected in this form
              addressLine1: addressValue.value.address?.line1 || '',
              addressLine2: addressValue.value.address?.line2 || '',
              city: addressValue.value.address?.city || '',
              state: addressValue.value.address?.state || '',
              postalCode: addressValue.value.address?.postal_code || '',
              country: addressValue.value.address?.country || 'IN',
              phone: shippingInfo.phone,
            }
            
            billingAddress = sameAsShipping ? shippingAddress : billingAddress
          }
        }
        
        onSuccess(paymentIntent.id, shippingInfo, {
          shippingAddress,
          billingAddress
        })
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
          {/* Saved Addresses Section */}
          {user && savedAddresses.length > 0 && (
            <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border/40">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Use Saved Address</Label>
              </div>
              <div className="grid gap-2">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`flex items-start justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedAddress?.id === address.id 
                        ? 'bg-primary/10 border-primary/50' 
                        : 'bg-background border-border/60 hover:border-primary/50'
                    }`}
                    onClick={() => autofillFromAddress(address)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">
                          {address.firstName} {address.lastName}
                        </p>
                        {address.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={selectedAddress?.id === address.id ? "default" : "outline"}
                      size="sm"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        autofillFromAddress(address)
                      }}
                    >
                      {selectedAddress?.id === address.id ? 'Selected' : 'Use'}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Click on an address to auto-fill the form below. 
                  <Link href="/account" className="text-primary hover:underline ml-1">
                    Manage addresses
                  </Link>
                </p>
                {selectedAddress && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedAddress(null)
                      setAddressData({ shippingAddress: null, billingAddress: null })
                      toast({
                        title: "Selection Cleared",
                        description: "Please fill in the address manually below",
                      })
                    }}
                    className="text-xs"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Loading state for addresses */}
          {user && loadingAddresses && (
            <div className="flex items-center gap-2 p-4 bg-muted/20 rounded-xl">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading saved addresses...</span>
            </div>
          )}

          {/* No saved addresses message */}
          {user && !loadingAddresses && savedAddresses.length === 0 && (
            <div className="p-4 bg-muted/20 rounded-xl border border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">No saved addresses</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your address will be saved automatically after this order. 
                <Link href="/account" className="text-primary hover:underline ml-1">
                  Manage addresses
                </Link>
              </p>
            </div>
          )}

          {/* Manual Entry Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">
                {savedAddresses.length > 0 ? 'Or Enter Manually' : 'Contact Information'}
              </Label>
            </div>
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
              disabled={!!(user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress)} // Disable if user is logged in
            />
            {(user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress) && (
              <p className="text-xs text-muted-foreground">
                Using your account email. <SignInButton mode="modal"><button className="text-primary hover:underline">Not you?</button></SignInButton>
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
          </div> {/* Close manual entry div */}
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