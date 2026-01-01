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
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
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
  const { toast } = useToast()
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
        toast({
          title: "Error",
          description: "Failed to load your orders",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Error",
        description: "Failed to load your orders",
        variant: "destructive"
      })
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
                      <p className="text-2xl font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                      <Button variant="outline" size="sm" className="rounded-full bg-transparent" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="mr-2 h-3 w-3" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4 rounded-2xl border border-border/40 p-4 bg-muted/20">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted/50">
                          <img
                            src={item.product.images?.[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-balance">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            <p className="text-sm text-muted-foreground">Unit Price: ₹{item.unitPrice.toFixed(2)}</p>
                          </div>
                          <p className="font-semibold">₹{item.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {order.status.toLowerCase() === "delivered" && (
                      <Button variant="outline" className="rounded-full bg-transparent">
                        Buy Again
                      </Button>
                    )}
                    {(order.status.toLowerCase() === "shipped" || order.status.toLowerCase() === "in_transit") && (
                      <Button className="rounded-full bg-primary hover:bg-primary/90">Track Order</Button>
                    )}
                    <Button variant="outline" className="rounded-full bg-transparent">
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
