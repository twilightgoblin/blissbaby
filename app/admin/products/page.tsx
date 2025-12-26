"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Upload } from "lucide-react"
import { useState } from "react"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const products = [
    {
      id: 1,
      name: "Organic Cotton Baby Onesie",
      category: "Clothing",
      price: 24.99,
      stock: 145,
      sales: 234,
      image: "/baby-onesie-organic-cotton.jpg",
      status: "active",
    },
    {
      id: 2,
      name: "Silicone Baby Bottle Set",
      category: "Feeding",
      price: 34.99,
      stock: 89,
      sales: 189,
      image: "/baby-bottle-silicone-set.jpg",
      status: "active",
    },
    {
      id: 3,
      name: "Soft Plush Teddy Bear",
      category: "Toys",
      price: 18.99,
      stock: 234,
      sales: 167,
      image: "/soft-teddy-bear-baby-toy.jpg",
      status: "active",
    },
    {
      id: 4,
      name: "Baby Monitor with Camera",
      category: "Baby Care",
      price: 99.99,
      stock: 23,
      sales: 145,
      image: "/baby-care-products.png",
      status: "low-stock",
    },
    {
      id: 5,
      name: "Natural Baby Shampoo",
      category: "Hygiene",
      price: 12.99,
      stock: 0,
      sales: 98,
      image: "/baby-hygiene-products.jpg",
      status: "out-of-stock",
    },
  ]

  const getStatusBadge = (status: string) => {
    const configs = {
      active: "bg-green-100 text-green-700 hover:bg-green-100",
      "low-stock": "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      "out-of-stock": "bg-red-100 text-red-700 hover:bg-red-100",
    }
    return configs[status as keyof typeof configs]
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-muted-foreground mt-2">Manage your product catalog</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Fill in the product details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" placeholder="Enter product name" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baby-care">Baby Care</SelectItem>
                      <SelectItem value="feeding">Feeding</SelectItem>
                      <SelectItem value="toys">Toys</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="hygiene">Hygiene</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" placeholder="0.00" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" type="number" placeholder="0" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Product description" className="rounded-xl" rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-muted/50 hover:bg-muted">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                    </div>
                    <input type="file" className="hidden" multiple />
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-full bg-transparent">
                Cancel
              </Button>
              <Button className="rounded-full bg-primary hover:bg-primary/90">Save Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="rounded-3xl border-border/60">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] rounded-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="baby-care">Baby Care</SelectItem>
                <SelectItem value="feeding">Feeding</SelectItem>
                <SelectItem value="toys">Toys</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="hygiene">Hygiene</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] rounded-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="grid gap-6">
        {products.map((product) => (
          <Card key={product.id} className="rounded-3xl border-border/60 hover-lift">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-muted/50">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-wrap gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <Badge className={`rounded-full border-0 ${getStatusBadge(product.status)}`}>
                        {product.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <Badge variant="secondary" className="rounded-full">
                        {product.category}
                      </Badge>
                      <span className="text-muted-foreground">{product.sales} sales</span>
                      <span className="text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 border-t border-border/40 pt-4">
                <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-transparent"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
