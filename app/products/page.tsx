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
import { Star, SlidersHorizontal, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function ProductsPage() {
  const [priceRange, setPriceRange] = useState([0, 100])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedAges, setSelectedAges] = useState<string[]>([])

  // TODO: Replace with API calls to fetch real products and categories
  const [products, setProducts] = useState([])
  const [categories] = useState([
    { id: "baby-care", label: "Baby Care" },
    { id: "feeding", label: "Feeding" },
    { id: "toys", label: "Toys" },
    { id: "clothing", label: "Clothing" },
    { id: "hygiene", label: "Hygiene" },
  ])

  const ageRanges = [
    { id: "0-6", label: "0-6 months" },
    { id: "6-12", label: "6-12 months" },
    { id: "12-24", label: "12-24 months" },
    { id: "24+", label: "2+ years" },
  ]

  // TODO: Add useEffect to fetch real products from API
  useEffect(() => {
    // fetchProducts().then(setProducts)
  }, [])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleAge = (ageId: string) => {
    setSelectedAges((prev) => (prev.includes(ageId) ? prev.filter((a) => a !== ageId) : [...prev, ageId]))
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedAges([])
    setPriceRange([0, 100])
  }

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Price Range</Label>
          <span className="text-sm text-muted-foreground">
            ${priceRange[0]} - ${priceRange[1]}
          </span>
        </div>
        <Slider value={priceRange} onValueChange={setPriceRange} max={100} step={5} className="w-full" />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Categories</Label>
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
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Age Range</Label>
        <div className="space-y-3">
          {ageRanges.map((age) => (
            <div key={age.id} className="flex items-center space-x-2">
              <Checkbox id={age.id} checked={selectedAges.includes(age.id)} onCheckedChange={() => toggleAge(age.id)} />
              <label
                htmlFor={age.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {age.label}
              </label>
            </div>
          ))}
        </div>
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
            <p className="text-muted-foreground">Showing {products.length} products</p>
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

              <Select defaultValue="popular">
                <SelectTrigger className="w-[180px] rounded-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategories.length > 0 || selectedAges.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((catId) => {
                const category = categories.find((c) => c.id === catId)
                return (
                  <Badge key={catId} variant="secondary" className="rounded-full gap-1">
                    {category?.label}
                    <button onClick={() => toggleCategory(catId)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
              {selectedAges.map((ageId) => {
                const age = ageRanges.find((a) => a.id === ageId)
                return (
                  <Badge key={ageId} variant="secondary" className="rounded-full gap-1">
                    {age?.label}
                    <button onClick={() => toggleAge(ageId)} className="ml-1 hover:text-destructive">
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
                  {(selectedCategories.length > 0 || selectedAges.length > 0) && (
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
            {products.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <Card className="group overflow-hidden rounded-3xl border-border/60 transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-muted/50">
                      {product.badge && (
                        <Badge className="absolute left-3 top-3 z-10 rounded-full bg-primary text-primary-foreground border-0">
                          {product.badge}
                        </Badge>
                      )}
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="space-y-3 p-4">
                      <h3 className="font-semibold group-hover:text-primary transition-colors text-balance">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium">{product.rating}</span>
                        </div>
                        <span className="text-muted-foreground">({product.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-primary">${product.price}</p>
                        <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90">
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
