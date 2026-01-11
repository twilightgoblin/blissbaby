"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, Users, IndianRupee, TrendingUp, TrendingDown, ArrowUpRight, RefreshCw, Plus, Store } from "lucide-react"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"
import { AdminSetupCard } from "@/components/admin/admin-setup-card"

interface DashboardStats {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: string
  color: string
}

interface RevenueData {
  month: string
  revenue: number
}

interface CategoryData {
  category: string
  sales: number
  revenue: number
}

interface RecentOrder {
  id: string
  customer: string
  amount: number
  status: string
  date: string
  items: number
}

interface TopProduct {
  name: string
  sales: number
  revenue: number
  category: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasData, setHasData] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [previousOrderCount, setPreviousOrderCount] = useState(0)

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      
      const data = await response.json()
      setStats(data.stats)
      setRevenueData(data.revenueData)
      setCategoryData(data.categoryData)
      setRecentOrders(data.recentOrders)
      setTopProducts(data.topProducts)
      
      // Check for new orders and show notification
      if (previousOrderCount > 0 && data.recentOrders.length > previousOrderCount) {
        const newOrdersCount = data.recentOrders.length - previousOrderCount
        toast.success(`${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} received!`)
      }
      setPreviousOrderCount(data.recentOrders.length)
      
      // Check if we have meaningful data
      const hasOrders = data.recentOrders.length > 0
      const hasProducts = data.topProducts.length > 0
      const hasRevenue = data.revenueData.some((item: RevenueData) => item.revenue > 0)
      setHasData(hasOrders || hasProducts || hasRevenue)
      setLastUpdated(new Date())
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    toast.success('Dashboard data refreshed')
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 30 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const getIconComponent = (iconName: string) => {
    const icons = {
      IndianRupee,
      ShoppingCart,
      Package,
      Users
    }
    return icons[iconName as keyof typeof icons] || IndianRupee
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      delivered: "bg-green-100 text-green-700 hover:bg-green-100",
      confirmed: "bg-green-100 text-green-700 hover:bg-green-100",
      processing: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      shipped: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      pending: "bg-gray-100 text-gray-700 hover:bg-gray-100",
      cancelled: "bg-red-100 text-red-700 hover:bg-red-100",
    }
    return configs[status as keyof typeof configs] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Loading dashboard data...</p>
          </div>
          <Badge className="rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-2">Admin</Badge>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-3xl border-border/60">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // No data state
  if (!hasData && !loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back! Let's get your store started.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge className="rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-2">Admin</Badge>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-6">
            <Store className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Your dashboard will show real-time analytics once you have products, orders, and customers. 
            Get started by adding some products to your store.
          </p>
          <div className="flex gap-4">
            <Link href="/admin/products">
              <Button className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Products
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline" className="rounded-full">
                <Package className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your store.
            {lastUpdated && (
              <span className="text-xs ml-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge className="rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-2">Admin</Badge>
        </div>
      </div>

      {/* Admin Setup Card */}
      <AdminSetupCard />

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-fade-in">
        {stats.map((stat) => {
          const Icon = getIconComponent(stat.icon)
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
                <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    className="text-xs" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="none"
                    fill="url(#revenueGradient)"
                    connectNulls={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={4}
                    strokeDasharray="0"
                    dot={{ 
                      fill: "hsl(var(--chart-1))", 
                      stroke: "hsl(var(--background))",
                      strokeWidth: 3,
                      r: 7
                    }}
                    activeDot={{ 
                      r: 9, 
                      fill: "hsl(var(--chart-1))",
                      stroke: "hsl(var(--background))",
                      strokeWidth: 3,
                      className: "drop-shadow-lg"
                    }}
                    connectNulls={true}
                    animationDuration={1500}
                    isAnimationActive={true}
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                </div>
                <p className="text-sm font-bold text-chart-1">{formatCurrency(product.revenue, 'INR')}</p>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="category" 
                    className="text-xs" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    className="text-xs" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Sales']}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="hsl(var(--chart-1))" 
                    radius={[8, 8, 0, 0]}
                    opacity={0.8}
                  />
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
                  <p className="text-sm font-bold text-chart-1">{formatCurrency(order.amount, 'INR')}</p>
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