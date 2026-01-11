"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Package, Truck, CheckCircle2, Clock, Eye, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  subtotal?: number
  taxAmount?: number
  shippingAmount?: number
  createdAt: string
  items: Array<{
    id: string
    product: {
      id: string
      name: string
      images: string[]
    }
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  shippingAddress?: {
    firstName: string
    lastName: string
    addressLine1: string
    city: string
    state: string
  }
}

export default function OrdersPage() {
  const { user, isSignedIn } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSignedIn && user) {
      fetchUserOrders()
    } else {
      setLoading(false)
    }
  }, [isSignedIn, user])

  const fetchUserOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders?userId=${user?.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setOrders(data.orders || [])
      } else {
        console.error('Failed to fetch orders:', data)
        toast.error("Failed to load your orders")
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error("Failed to load your orders")
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return {
          label: "Delivered",
          icon: CheckCircle2,
          className: "bg-green-100 text-green-700 hover:bg-green-100",
        }
      case "shipped":
      case "in_transit":
        return {
          label: "In Transit",
          icon: Truck,
          className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
        }
      case "processing":
        return {
          label: "Processing",
          icon: Clock,
          className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        }
      case "confirmed":
        return {
          label: "Confirmed",
          icon: CheckCircle2,
          className: "bg-green-100 text-green-700 hover:bg-green-100",
        }
      case "pending":
        return {
          label: "Pending",
          icon: Clock,
          className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
        }
      case "cancelled":
        return {
          label: "Cancelled",
          icon: Package,
          className: "bg-red-100 text-red-700 hover:bg-red-100",
        }
      default:
        return {
          label: status,
          icon: Package,
          className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
        }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to view your order history.</p>
            <Button className="rounded-full bg-primary hover:bg-primary/90" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
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
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Order History</h1>
          <p className="text-muted-foreground">View and track all your orders</p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status)
            const StatusIcon = statusConfig.icon

            return (
              <Card key={order.id} className="overflow-hidden rounded-3xl border-border/60">
                <CardContent className="p-6">
                  {/* Order Header */}
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">Order {order.orderNumber}</h3>
                        <Badge className={`rounded-full border-0 ${statusConfig.className}`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
                      {order.shippingAddress && (
                        <p className="text-sm text-muted-foreground">
                          Shipping to: {order.shippingAddress.firstName} {order.shippingAddress.lastName}, {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-2xl font-bold text-primary">{formatCurrency(Number(order.totalAmount))}</p>
                      <Button variant="outline" size="sm" className="rounded-full bg-transparent" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="mr-2 h-3 w-3" />
                          Order Details
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {(order.order_items || []).map((item) => (
                      <div key={item.id} className="flex gap-4 rounded-2xl border border-border/40 p-4 bg-muted/20">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted/50">
                          <img
                            src={item.products.images?.[0] || "/placeholder.svg"}
                            alt={item.products.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-balance">{item.products.name}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            <p className="text-sm text-muted-foreground">Unit Price: {formatCurrency(Number(item.unitPrice))}</p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="font-semibold">{formatCurrency(Number(item.totalPrice))}</p>
                            <Button variant="outline" size="sm" className="rounded-full bg-transparent" asChild>
                              <Link href={`/products/${item.products.id}`}>
                                <Eye className="mr-1 h-3 w-3" />
                                View Product
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Order Summary */}
                    <div className="mt-4 p-4 bg-muted/10 rounded-2xl border border-border/20">
                      <h4 className="font-semibold mb-3">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatCurrency((order.order_items || []).reduce((sum, item) => sum + Number(item.totalPrice), 0))}</span>
                        </div>
                        {order.taxAmount && Number(order.taxAmount) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax</span>
                            <span>{formatCurrency(Number(order.taxAmount))}</span>
                          </div>
                        )}
                        {order.shippingAmount && Number(order.shippingAmount) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>{formatCurrency(Number(order.shippingAmount))}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-primary">{formatCurrency(Number(order.totalAmount))}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {order.status.toLowerCase() === "delivered" && (
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-transparent"
                        onClick={() => {
                          // Add items back to cart logic here
                          alert('Buy Again functionality coming soon!');
                        }}
                      >
                        Buy Again
                      </Button>
                    )}
                    {(order.status.toLowerCase() === "shipped" || order.status.toLowerCase() === "in_transit") && (
                      <Button 
                        className="rounded-full bg-primary hover:bg-primary/90"
                        onClick={() => {
                          // Add tracking logic here
                          alert('Order tracking functionality coming soon!');
                        }}
                      >
                        Track Order
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="rounded-full bg-transparent"
                      onClick={() => {
                        // Open support modal or redirect to support page
                        window.open('mailto:support@babybliss.com?subject=Order Support - ' + order.orderNumber, '_blank');
                      }}
                    >
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
            <Button className="rounded-full bg-primary hover:bg-primary/90" asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
