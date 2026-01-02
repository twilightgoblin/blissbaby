"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Star, SlidersHorizontal, X, ShoppingCart, Eye } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  description?: string
  price: string
  comparePrice?: string
  images: string[]
  brand?: string
  featured: boolean
  inventory: number
  category?: {
    id: string
    name: string
    color?: string
  }
}

interface Category {
  id: string
  name: string
  description?: string
  color?: string
  _count?: {
    products: number
  }
}

export default function ProductsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isSignedIn } = useUser()
  const { addToCart, loading: cartLoading } = useCart()
  
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('popular')
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{ [key: string]: string | string[] | undefined }>({})
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const getSearchParams = async () => {
      const params = await searchParams
      setResolvedSearchParams(params)
    }
    getSearchParams()
  }, [searchParams])

  const handleAddToCart = async (product: Product, event: React.MouseEvent) => {
    event.preventDefault() // Prevent navigation to product detail page
    event.stopPropagation()

    // Check if user is authenticated
    if (!isSignedIn || !user) {
      toast.error("Please sign in to add items to your cart")
      return
    }

    // Check if product is in stock
    if (product.inventory <= 0) {
      toast.error("This product is out of stock")
      return
    }

    try {
      setAddingToCart(product.id)
      await addToCart(product.id, 1)
      toast.success(`Added ${product.name} to cart!`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error("Failed to add item to cart. Please try again.")
    } finally {
      setAddingToCart(null)
    }
  }

  // Initialize filters from URL params
  useEffect(() => {
    const categoryParam = resolvedSearchParams.category as string
    if (categoryParam) {
      setSelectedCategories([categoryParam])
    }
    
    const sortParam = resolvedSearchParams.sort as string
    if (sortParam) {
      setSortBy(sortParam)
    }
    
    const minPrice = resolvedSearchParams.minPrice as string
    const maxPrice = resolvedSearchParams.maxPrice as string
    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 10000
      ])
    }
  }, [resolvedSearchParams])

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories')
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories || [])

        // Build products API URL with filters
        const params = new URLSearchParams()
        if (selectedCategories.length > 0) {
          params.set('category', selectedCategories[0]) // For now, support single category
        }
        if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString())
        if (priceRange[1] < 10000) params.set('maxPrice', priceRange[1].toString())
        params.set('sortBy', sortBy)

        // Fetch products
        const productsResponse = await fetch(`/api/products?${params.toString()}`)
        const productsData = await productsResponse.json()
        setProducts(productsData.products || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedCategories, priceRange, sortBy])

  const updateURL = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams()
    
    // Add existing params
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        params.set(key, value)
      }
    })
    
    // Update with new params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((c) => c !== categoryId)
      : [categoryId] // For now, only allow single category selection
    
    setSelectedCategories(newCategories)
    updateURL({ category: newCategories[0] || null })
  }

  const handlePriceChange = (newRange: number[]) => {
    setPriceRange(newRange)
    updateURL({
      minPrice: newRange[0] > 0 ? newRange[0].toString() : null,
      maxPrice: newRange[1] < 10000 ? newRange[1].toString() : null
    })
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    updateURL({ sort: newSort })
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 10000])
    setSortBy('popular')
    router.push(pathname)
  }

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Price Range</Label>
          <span className="text-sm text-muted-foreground">
            {formatCurrency(priceRange[0], '₹', 0)} - {formatCurrency(priceRange[1], '₹', 0)}
          </span>
        </div>
        <Slider 
          value={priceRange} 
          onValueChange={handlePriceChange} 
          max={10000} 
          step={100} 
          className="w-full" 
        />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Categories</Label>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <label
                  htmlFor={category.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  {category.name}
                  {category._count && category._count.products > 0 && (
                    <span className="text-muted-foreground ml-1">({category._count.products})</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={clearFilters} variant="outline" className="w-full rounded-full bg-transparent">
        Clear All Filters
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All Products</h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-muted-foreground">
              {loading ? 'Loading...' : `Showing ${products.length} products`}
            </p>
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="rounded-full lg:hidden bg-transparent">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] rounded-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((catId) => {
                const category = categories.find((c) => c.id === catId)
                return (
                  <Badge key={catId} variant="secondary" className="rounded-full gap-1">
                    {category?.name}
                    <button onClick={() => toggleCategory(catId)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block">
            <Card className="rounded-3xl border-border/60 sticky top-24">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  {selectedCategories.length > 0 && (
                    <Button onClick={clearFilters} variant="ghost" size="sm" className="h-auto p-0 text-primary">
                      Clear
                    </Button>
                  )}
                </div>
                <FiltersContent />
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              // Loading skeleton
              [...Array(9)].map((_, index) => (
                <Card key={index} className="overflow-hidden rounded-3xl border-border/60 animate-pulse">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-8 bg-muted rounded w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search criteria</p>
                <Button onClick={clearFilters} variant="outline" className="mt-4 rounded-full">
                  Clear Filters
                </Button>
              </div>
            ) : (
              products.map((product) => (
                <Card key={product.id} className="group overflow-hidden rounded-3xl border-border/60 transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-0">
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative aspect-square bg-muted/50">
                        {product.featured && (
                          <Badge className="absolute left-3 top-3 z-10 rounded-full bg-primary text-primary-foreground border-0">
                            Featured
                          </Badge>
                        )}
                        {product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (
                          <Badge className="absolute right-3 top-3 z-10 rounded-full bg-destructive text-destructive-foreground border-0">
                            {Math.round(((parseFloat(product.comparePrice) - parseFloat(product.price)) / parseFloat(product.comparePrice)) * 100)}% OFF
                          </Badge>
                        )}
                        <img
                          src={product.images?.[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                    </Link>
                    <div className="space-y-3 p-4">
                      <div className="space-y-1">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold group-hover:text-primary transition-colors text-balance line-clamp-2 hover:text-primary">
                            {product.name}
                          </h3>
                        </Link>
                        {product.brand && (
                          <p className="text-sm text-muted-foreground">{product.brand}</p>
                        )}
                        {product.category && (
                          <Badge variant="outline" className="text-xs">
                            {product.category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium">4.5</span>
                        </div>
                        <span className="text-muted-foreground">(0)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <p className="text-lg font-bold text-primary">{formatCurrency(parseFloat(product.price))}</p>
                          {product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (
                            <p className="text-sm text-muted-foreground line-through">{formatCurrency(parseFloat(product.comparePrice))}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-full bg-transparent hover:bg-primary hover:text-primary-foreground"
                            asChild
                          >
                            <Link href={`/products/${product.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            className="rounded-full bg-primary hover:bg-primary/90"
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={addingToCart === product.id || cartLoading || product.inventory <= 0}
                          >
                            {addingToCart === product.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <ShoppingCart className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {product.inventory <= 5 && product.inventory > 0 && (
                        <p className="text-xs text-orange-600">Only {product.inventory} left in stock!</p>
                      )}
                      {product.inventory === 0 && (
                        <p className="text-xs text-red-600">Out of stock</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
