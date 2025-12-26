"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Package, Truck, CheckCircle2, Clock, Eye } from "lucide-react"

export default function OrdersPage() {
  const orders = [
    {
      id: "BB-12345",
      date: "Dec 20, 2024",
      status: "delivered",
      total: 84.97,
      items: [
        {
          id: 1,
          name: "Organic Cotton Baby Onesie",
          quantity: 2,
          price: 24.99,
          image: "/baby-onesie-organic-cotton.jpg",
        },
        {
          id: 2,
          name: "Silicone Baby Bottle Set",
          quantity: 1,
          price: 34.99,
          image: "/baby-bottle-silicone-set.jpg",
        },
      ],
    },
    {
      id: "BB-12344",
      date: "Dec 15, 2024",
      status: "in-transit",
      total: 62.97,
      items: [
        {
          id: 3,
          name: "Soft Plush Teddy Bear",
          quantity: 1,
          price: 18.99,
          image: "/soft-teddy-bear-baby-toy.jpg",
        },
        {
          id: 4,
          name: "Natural Baby Skincare Kit",
          quantity: 1,
          price: 42.99,
          image: "/baby-skincare-natural-products.jpg",
        },
      ],
    },
    {
      id: "BB-12343",
      date: "Dec 10, 2024",
      status: "processing",
      total: 29.99,
      items: [
        {
          id: 7,
          name: "Muslin Swaddle Blankets 3-Pack",
          quantity: 1,
          price: 29.99,
          image: "/muslin-swaddle-blankets-pack.jpg",
        },
      ],
    },
  ]

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          label: "Delivered",
          icon: CheckCircle2,
          className: "bg-green-100 text-green-700 hover:bg-green-100",
        }
      case "in-transit":
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
      default:
        return {
          label: "Unknown",
          icon: Package,
          className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
        }
    }
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
                        <h3 className="text-lg font-semibold">Order {order.id}</h3>
                        <Badge className={`rounded-full border-0 ${statusConfig.className}`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</p>
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
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-balance">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {order.status === "delivered" && (
                      <Button variant="outline" className="rounded-full bg-transparent">
                        Buy Again
                      </Button>
                    )}
                    {order.status === "in-transit" && (
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
