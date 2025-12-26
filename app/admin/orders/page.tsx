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
import { Search, Eye, Package, Truck, CheckCircle, XCircle } from "lucide-react"

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  // TODO: Replace with API call to fetch real orders
  const [orders, setOrders] = useState([])

  // TODO: Add useEffect to fetch real orders from API
  useEffect(() => {
    // fetchAdminOrders().then(setOrders)
  }, [])

  const getStatusConfig = (status: string) => {
    const configs = {
      completed: {
        badge: "bg-green-100 text-green-700 hover:bg-green-100",
        icon: CheckCircle,
        iconColor: "text-green-600",
      },
      processing: {
        badge: "bg-blue-100 text-blue-700 hover:bg-blue-100",
        icon: Package,
        iconColor: "text-blue-600",
      },
      shipped: {
        badge: "bg-purple-100 text-purple-700 hover:bg-purple-100",
        icon: Truck,
        iconColor: "text-purple-600",
      },
      pending: {
        badge: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        icon: Package,
        iconColor: "text-yellow-600",
      },
      cancelled: {
        badge: "bg-red-100 text-red-700 hover:bg-red-100",
        icon: XCircle,
        iconColor: "text-red-600",
      },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground mt-2">Manage and track customer orders</p>
        </div>
        <div className="flex gap-2">
          <Badge className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100">12 Processing</Badge>
          <Badge className="rounded-full bg-purple-100 text-purple-700 hover:bg-purple-100">8 Shipped</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-3xl border-border/60">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search orders or customers..." className="pl-10 rounded-full" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest">
              <SelectTrigger className="w-[180px] rounded-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Amount</SelectItem>
                <SelectItem value="lowest">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status)
          const StatusIcon = statusConfig.icon
          return (
            <Card key={order.id} className="rounded-3xl border-border/60 hover-lift">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-6">
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-muted`}>
                    <StatusIcon className={`h-7 w-7 ${statusConfig.iconColor}`} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{order.id}</h3>
                          <Badge className={`rounded-full border-0 ${statusConfig.badge}`}>{order.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customer} • {order.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{order.items} items</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>📅 {order.date}</span>
                      <span>🕐 {order.time}</span>
                      <span>💳 {order.payment}</span>
                      <span>📦 {order.shipping}</span>
                    </div>
                    <div className="flex gap-2 border-t border-border/40 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                            <Eye className="mr-2 h-3 w-3" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl rounded-3xl">
                          <DialogHeader>
                            <DialogTitle>Order Details - {order.id}</DialogTitle>
                            <DialogDescription>Complete order information and status</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                <p className="font-semibold">{order.customer}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="font-semibold">{order.email}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                                <p className="font-semibold">
                                  {order.date} at {order.time}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                <p className="font-semibold text-primary">${order.total.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {order.status !== "completed" && order.status !== "cancelled" && (
                        <Select defaultValue={order.status}>
                          <SelectTrigger className="w-[150px] rounded-full">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
