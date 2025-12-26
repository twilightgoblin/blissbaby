"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, Users, DollarSign, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { useState, useEffect } from "react"

export default function AdminDashboard() {
  // TODO: Replace with API calls to fetch real dashboard data
  const [stats, setStats] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])

  // TODO: Add useEffect to fetch real dashboard data from API
  useEffect(() => {
    // fetchDashboardStats().then(setStats)
    // fetchRevenueData().then(setRevenueData)
    // fetchCategoryData().then(setCategoryData)
    // fetchRecentOrders().then(setRecentOrders)
    // fetchTopProducts().then(setTopProducts)
  }, [])

  const getStatusBadge = (status: string) => {
    const configs = {
      completed: "bg-green-100 text-green-700 hover:bg-green-100",
      processing: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      shipped: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    }
    return configs[status as keyof typeof configs] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening with your store.</p>
        </div>
        <Badge className="rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-2">Admin</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-fade-in">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
          return (
            <Card key={stat.title} className="rounded-3xl border-border/60 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <TrendIcon className="h-4 w-4" />
                      <span>{stat.change}</span>
                      <span className="text-muted-foreground font-normal">from last month</span>
                    </div>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="rounded-3xl border-border/60 lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly revenue for the last 6 months</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="rounded-3xl border-border/60 lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <p className="text-sm text-muted-foreground">Best selling products this month</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                </div>
                <p className="text-sm font-bold text-primary">${product.revenue.toFixed(2)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Category Sales Chart */}
        <Card className="rounded-3xl border-border/60 lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <p className="text-sm text-muted-foreground">Product category performance</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="category" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="rounded-3xl border-border/60 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground">Latest customer orders</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full">
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-2xl border border-border/40 p-4 hover-lift"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.customer}</p>
                  <Badge className={`rounded-full border-0 text-xs ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-bold text-primary">${order.amount}</p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
