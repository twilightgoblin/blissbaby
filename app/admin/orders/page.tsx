"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  products: {
    id: string
    name: string
    images: string[]
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  currency: string
  userEmail: string | null
  userName: string | null
  createdAt: string
  order_items: OrderItem[]
  payments: any[]
  addresses_orders_shippingAddressIdToaddresses: any
  addresses_orders_billingAddressIdToaddresses: any
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders)
        setPagination(data.pagination)
      } else {
        console.error('Failed to fetch orders:', data.error)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, pagination.page])

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [statusFilter, pagination.page, searchQuery])

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchOrders()
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
        })
      })

      if (response.ok) {
        fetchOrders() // Refresh the orders list
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      COMPLETED: {
        badge: "bg-green-100 text-green-700 hover:bg-green-100",
        icon: CheckCircle,
        iconColor: "text-green-600",
        label: "Completed"
      },
      PROCESSING: {
        badge: "bg-blue-100 text-blue-700 hover:bg-blue-100",
        icon: Package,
        iconColor: "text-blue-600",
        label: "Processing"
      },
      SHIPPED: {
        badge: "bg-purple-100 text-purple-700 hover:bg-purple-100",
        icon: Truck,
        iconColor: "text-purple-600",
        label: "Shipped"
      },
      DELIVERED: {
        badge: "bg-green-100 text-green-700 hover:bg-green-100",
        icon: CheckCircle,
        iconColor: "text-green-600",
        label: "Delivered"
      },
      PENDING: {
        badge: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        icon: Clock,
        iconColor: "text-yellow-600",
        label: "Pending"
      },
      CONFIRMED: {
        badge: "bg-blue-100 text-blue-700 hover:bg-blue-100",
        icon: CheckCircle,
        iconColor: "text-blue-600",
        label: "Confirmed"
      },
      CANCELLED: {
        badge: "bg-red-100 text-red-700 hover:bg-red-100",
        icon: XCircle,
        iconColor: "text-red-600",
        label: "Cancelled"
      },
      REFUNDED: {
        badge: "bg-gray-100 text-gray-700 hover:bg-gray-100",
        icon: AlertCircle,
        iconColor: "text-gray-600",
        label: "Refunded"
      }
    }
    return configs[status as keyof typeof configs] || configs.PENDING
  }

  const getStatusCounts = () => {
    const counts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      processing: counts.PROCESSING || 0,
      shipped: counts.SHIPPED || 0,
      pending: counts.PENDING || 0,
      completed: counts.COMPLETED || 0
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground mt-2">Manage and track customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const response = await fetch('/api/notifications/test-admin', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: '🧪 Admin Test Notification',
                    body: 'Testing admin notification system - this is a test message!'
                  })
                })
                const data = await response.json()
                if (response.ok) {
                  toast.success(`🎉 Test notification sent to ${data.successCount} admin users!`)
                } else {
                  toast.error(`Failed to send test notification: ${data.error}`)
                }
              } catch (error) {
                console.error('Error sending test notification:', error)
                toast.error('Error sending test notification')
              }
            }}
            className="rounded-2xl"
          >
            🧪 Test Admin Notifications
          </Button>
          <Badge className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100">
            {statusCounts.processing} Processing
          </Badge>
          <Badge className="rounded-full bg-purple-100 text-purple-700 hover:bg-purple-100">
            {statusCounts.shipped} Shipped
          </Badge>
          <Badge className="rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            {statusCounts.pending} Pending
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-3xl border-border/60">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order number, customer email, or name..."
                className="pl-10 rounded-2xl border-border/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-2xl border-border/60">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="rounded-2xl">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-muted-foreground">Loading orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <Card className="rounded-3xl border-border/60">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Orders will appear here once customers start placing them.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status)
            const StatusIcon = statusConfig.icon
            
            return (
              <Card key={order.id} className="rounded-3xl border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${statusConfig.iconColor}`} />
                        <div>
                          <div className="font-semibold text-lg">{order.orderNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.userName || 'Guest'} • {order.userEmail}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {formatCurrency(Number(order.totalAmount), order.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <Badge className={statusConfig.badge}>
                        {statusConfig.label}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Select
                          value={order.status.toLowerCase()}
                          onValueChange={(value) => handleStatusUpdate(order.id, value)}
                        >
                          <SelectTrigger className="w-[140px] rounded-2xl border-border/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-2xl">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
                              <DialogDescription>
                                Order placed on {new Date(order.createdAt).toLocaleDateString()}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Customer Info */}
                              <div>
                                <h4 className="font-semibold mb-2">Customer Information</h4>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <p><strong>Name:</strong> {order.userName || 'Guest'}</p>
                                  <p><strong>Email:</strong> {order.userEmail}</p>
                                </div>
                              </div>
                              
                              {/* Order Items */}
                              <div>
                                <h4 className="font-semibold mb-2">Order Items</h4>
                                <div className="space-y-2">
                                  {(order.order_items || []).map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        {item.products.images?.[0] && (
                                          <img 
                                            src={item.products.images[0]} 
                                            alt={item.products.name}
                                            className="w-12 h-12 object-cover rounded"
                                          />
                                        )}
                                        <div>
                                          <p className="font-medium">{item.products.name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Qty: {item.quantity} × {formatCurrency(Number(item.unitPrice), order.currency)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="font-semibold">
                                        {formatCurrency(Number(item.totalPrice), order.currency)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Order Summary */}
                              <div>
                                <h4 className="font-semibold mb-2">Order Summary</h4>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <div className="flex justify-between text-lg font-semibold">
                                    <span>Total Amount:</span>
                                    <span>{formatCurrency(Number(order.totalAmount), order.currency)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Addresses */}
                              {order.addresses_orders_shippingAddressIdToaddresses && (
                                <div>
                                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <p>{order.addresses_orders_shippingAddressIdToaddresses.firstName} {order.addresses_orders_shippingAddressIdToaddresses.lastName}</p>
                                    <p>{order.addresses_orders_shippingAddressIdToaddresses.addressLine1}</p>
                                    {order.addresses_orders_shippingAddressIdToaddresses.addressLine2 && <p>{order.addresses_orders_shippingAddressIdToaddresses.addressLine2}</p>}
                                    <p>{order.addresses_orders_shippingAddressIdToaddresses.city}, {order.addresses_orders_shippingAddressIdToaddresses.state} {order.addresses_orders_shippingAddressIdToaddresses.postalCode}</p>
                                    <p>{order.addresses_orders_shippingAddressIdToaddresses.country}</p>
                                    {order.addresses_orders_shippingAddressIdToaddresses.phone && <p>Phone: {order.addresses_orders_shippingAddressIdToaddresses.phone}</p>}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border/60">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Order placed: {new Date(order.createdAt).toLocaleString()}</span>
                      <span>Last updated: {new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="rounded-2xl"
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="rounded-2xl"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}