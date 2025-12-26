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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Edit, Trash2, Upload, IndianRupee, Package, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  comparePrice?: number
  sku?: string
  barcode?: string
  categoryId?: string
  category?: {
    id: string
    name: string
  }
  brand?: string
  images: string[]
  weight?: number
  dimensions?: any
  inventory: number
  lowStock: number
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  featured: boolean
  tags: string[]
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    categoryId: '',
    brand: '',
    inventory: '',
    lowStock: '5',
    sku: '',
    barcode: '',
    weight: '',
    featured: false,
    status: 'ACTIVE' as const,
    tags: [] as string[],
    seoTitle: '',
    seoDescription: ''
  })
  const { toast } = useToast()

  // Fetch products and categories
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [searchQuery, categoryFilter, statusFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/admin/products?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setProducts(data.products)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch products",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      categoryId: '',
      brand: '',
      inventory: '',
      lowStock: '5',
      sku: '',
      barcode: '',
      weight: '',
      featured: false,
      status: 'ACTIVE',
      tags: [],
      seoTitle: '',
      seoDescription: ''
    })
  }

  const handleAddProduct = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Product added successfully"
        })
        setIsAddDialogOpen(false)
        resetForm()
        fetchProducts()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add product",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      })
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return
    
    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Product updated successfully"
        })
        setIsEditDialogOpen(false)
        setSelectedProduct(null)
        resetForm()
        fetchProducts()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update product",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      })
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    
    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || "Product deleted successfully"
        })
        setIsDeleteDialogOpen(false)
        setSelectedProduct(null)
        fetchProducts()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete product",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      categoryId: product.categoryId || '',
      brand: product.brand || '',
      inventory: product.inventory.toString(),
      lowStock: product.lowStock.toString(),
      sku: product.sku || '',
      barcode: product.barcode || '',
      weight: product.weight?.toString() || '',
      featured: product.featured,
      status: product.status,
      tags: product.tags,
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || ''
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      ACTIVE: "bg-green-100 text-green-700 hover:bg-green-100",
      INACTIVE: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      ARCHIVED: "bg-red-100 text-red-700 hover:bg-red-100",
    }
    return configs[status as keyof typeof configs] || configs.ACTIVE
  }

  const getStockStatus = (inventory: number, lowStock: number) => {
    if (inventory === 0) return { status: 'out-of-stock', label: 'Out of Stock', color: 'bg-red-100 text-red-700' }
    if (inventory <= lowStock) return { status: 'low-stock', label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' }
    return { status: 'in-stock', label: 'In Stock', color: 'bg-green-100 text-green-700' }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-muted-foreground mt-2">Manage your product catalog</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary/90" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Fill in the product details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter product name" 
                      className="rounded-xl"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Product description" 
                    className="rounded-xl" 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing (Indian Rupees)</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="price" 
                        type="number" 
                        placeholder="0.00" 
                        className="rounded-xl pl-10"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Compare Price (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="comparePrice" 
                        type="number" 
                        placeholder="0.00" 
                        className="rounded-xl pl-10"
                        value={formData.comparePrice}
                        onChange={(e) => setFormData({...formData, comparePrice: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Inventory</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="inventory">Stock Quantity *</Label>
                    <Input 
                      id="inventory" 
                      type="number" 
                      placeholder="0" 
                      className="rounded-xl"
                      value={formData.inventory}
                      onChange={(e) => setFormData({...formData, inventory: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowStock">Low Stock Alert</Label>
                    <Input 
                      id="lowStock" 
                      type="number" 
                      placeholder="5" 
                      className="rounded-xl"
                      value={formData.lowStock}
                      onChange={(e) => setFormData({...formData, lowStock: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input 
                      id="sku" 
                      placeholder="Product SKU" 
                      className="rounded-xl"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input 
                      id="brand" 
                      placeholder="Brand name" 
                      className="rounded-xl"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      step="0.01"
                      placeholder="0.00" 
                      className="rounded-xl"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') => setFormData({...formData, status: value})}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox 
                      id="featured" 
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({...formData, featured: !!checked})}
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-full bg-transparent" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="rounded-full bg-primary hover:bg-primary/90" onClick={handleAddProduct}>
                Add Product
              </Button>
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
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Package className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <Card className="rounded-3xl border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' 
                ? "Try adjusting your filters to see more products."
                : "Get started by adding your first product."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.inventory, product.lowStock)
            return (
              <Card key={product.id} className="rounded-3xl border-border/60 hover-lift">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-muted/50">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-wrap gap-6">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            {product.sku && (
                              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge className={`rounded-full border-0 ${getStatusBadge(product.status)}`}>
                              {product.status.toLowerCase()}
                            </Badge>
                            <Badge className={`rounded-full border-0 ${stockStatus.color}`}>
                              {stockStatus.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {product.category && (
                            <Badge variant="secondary" className="rounded-full">
                              {product.category.name}
                            </Badge>
                          )}
                          {product.brand && (
                            <span className="text-muted-foreground">Brand: {product.brand}</span>
                          )}
                          <span className="text-muted-foreground">Stock: {product.inventory}</span>
                          {product.featured && (
                            <Badge className="rounded-full bg-purple-100 text-purple-700 border-0">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <p className="text-lg text-muted-foreground line-through">
                              {formatPrice(product.comparePrice)}
                            </p>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-border/40 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full bg-transparent"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-transparent"
                      onClick={() => openDeleteDialog(product)}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Product Name *</Label>
                  <Input 
                    id="edit-name" 
                    placeholder="Enter product name" 
                    className="rounded-xl"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  placeholder="Product description" 
                  className="rounded-xl" 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing (Indian Rupees)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (₹) *</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="edit-price" 
                      type="number" 
                      placeholder="0.00" 
                      className="rounded-xl pl-10"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-comparePrice">Compare Price (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="edit-comparePrice" 
                      type="number" 
                      placeholder="0.00" 
                      className="rounded-xl pl-10"
                      value={formData.comparePrice}
                      onChange={(e) => setFormData({...formData, comparePrice: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Inventory</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-inventory">Stock Quantity *</Label>
                  <Input 
                    id="edit-inventory" 
                    type="number" 
                    placeholder="0" 
                    className="rounded-xl"
                    value={formData.inventory}
                    onChange={(e) => setFormData({...formData, inventory: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lowStock">Low Stock Alert</Label>
                  <Input 
                    id="edit-lowStock" 
                    type="number" 
                    placeholder="5" 
                    className="rounded-xl"
                    value={formData.lowStock}
                    onChange={(e) => setFormData({...formData, lowStock: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sku">SKU</Label>
                  <Input 
                    id="edit-sku" 
                    placeholder="Product SKU" 
                    className="rounded-xl"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-brand">Brand</Label>
                  <Input 
                    id="edit-brand" 
                    placeholder="Brand name" 
                    className="rounded-xl"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Weight (kg)</Label>
                  <Input 
                    id="edit-weight" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    className="rounded-xl"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') => setFormData({...formData, status: value})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox 
                    id="edit-featured" 
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({...formData, featured: !!checked})}
                  />
                  <Label htmlFor="edit-featured">Featured Product</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full bg-transparent" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full bg-primary hover:bg-primary/90" onClick={handleEditProduct}>
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
              {selectedProduct && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">Product Details:</div>
                  <div className="text-sm text-muted-foreground">SKU: {selectedProduct.sku || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Price: {formatPrice(selectedProduct.price)}</div>
                  <div className="text-sm text-muted-foreground">Stock: {selectedProduct.inventory}</div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="rounded-full bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteProduct}
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}