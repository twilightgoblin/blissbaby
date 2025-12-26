"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Mail, Phone, MapPin, ShoppingBag, Star } from "lucide-react"

export default function CustomersPage() {
  const customers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 123-4567",
      location: "New York, USA",
      orders: 12,
      totalSpent: 1456.78,
      status: "vip",
      joinDate: "Jan 2024",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Mike Peters",
      email: "mike.p@email.com",
      phone: "+1 (555) 234-5678",
      location: "Los Angeles, USA",
      orders: 8,
      totalSpent: 892.45,
      status: "regular",
      joinDate: "Feb 2024",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Emma Wilson",
      email: "emma.w@email.com",
      phone: "+1 (555) 345-6789",
      location: "Chicago, USA",
      orders: 15,
      totalSpent: 2134.56,
      status: "vip",
      joinDate: "Dec 2023",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "John Davis",
      email: "john.d@email.com",
      phone: "+1 (555) 456-7890",
      location: "Houston, USA",
      orders: 5,
      totalSpent: 567.23,
      status: "regular",
      joinDate: "Mar 2024",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      name: "Lisa Chen",
      email: "lisa.c@email.com",
      phone: "+1 (555) 567-8901",
      location: "San Francisco, USA",
      orders: 3,
      totalSpent: 345.67,
      status: "new",
      joinDate: "Nov 2024",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const getStatusBadge = (status: string) => {
    const configs = {
      vip: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 hover:from-yellow-100 hover:to-amber-100 border border-yellow-200",
      regular: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      new: "bg-green-100 text-green-700 hover:bg-green-100",
    }
    return configs[status as keyof typeof configs]
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-2">Manage your customer database</p>
        </div>
        <div className="flex gap-2">
          <Badge className="rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 hover:from-yellow-100 hover:to-amber-100 border border-yellow-200">
            <Star className="mr-1 h-3 w-3" />
            45 VIP
          </Badge>
          <Badge className="rounded-full bg-muted text-muted-foreground hover:bg-muted">3,842 Total</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-3xl border-border/60">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-10 rounded-full" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] rounded-full">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="vip">VIP Customers</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="new">New Customers</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="orders">
              <SelectTrigger className="w-[180px] rounded-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orders">Most Orders</SelectItem>
                <SelectItem value="spending">Highest Spending</SelectItem>
                <SelectItem value="recent">Recently Joined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {customers.map((customer) => (
          <Card key={customer.id} className="rounded-3xl border-border/60 hover-lift">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <Badge className={`rounded-full border-0 ${getStatusBadge(customer.status)}`}>
                        {customer.status === "vip" && <Star className="mr-1 h-3 w-3 fill-current" />}
                        {customer.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Joined {customer.joinDate}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{customer.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-4">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShoppingBag className="h-4 w-4" />
                      <span className="text-sm">{customer.orders} orders</span>
                    </div>
                    <p className="text-lg font-bold text-primary mt-1">${customer.totalSpent.toFixed(2)}</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
