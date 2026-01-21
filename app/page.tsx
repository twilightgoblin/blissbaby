"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star, Truck, Shield, HeadphonesIcon, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, Suspense } from "react"
import { formatCurrency } from "@/lib/utils"
import { OfferCarousel } from "@/components/offer-carousel"
import { AdminRedirectAlert } from "@/components/admin-redirect-alert"

interface Category {
  id: string
  name: string
  image?: string
  icon?: string
  color?: string
  _count?: {
    products: number
  }
}

interface Product {
  id: string
  name: string
  price: string
  salePrice?: string
  comparePrice?: string
  images?: string[]
  featured?: boolean
  rating?: string
  reviewCount?: string
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories')
        const categoriesData = await categoriesResponse.json()
        console.log('Categories data:', categoriesData) // Debug log
        setCategories(categoriesData.categories || [])

        // Fetch featured products
        const productsResponse = await fetch('/api/products?featured=true&limit=4')
        const productsData = await productsResponse.json()
        setFeaturedProducts(productsData.products || [])

        // Fetch active offers for home page
        const offersResponse = await fetch('/api/offers?type=BANNER')
        const offersData = await offersResponse.json()
        setOffers(offersData.offers || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      <Header />

      {/* Admin Redirect Alert */}
      <Suspense fallback={null}>
        <AdminRedirectAlert />
      </Suspense>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-12 items-center">
            <div className="space-y-4 sm:space-y-5 lg:space-y-6 animate-fade-in-up">
              <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-0 animate-scale-in">
                <Sparkles className="mr-1 h-3 w-3 animate-pulse" />
                New Collection 2024
              </Badge>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-balance leading-tight">
                Everything Your Baby Needs, All in One Place
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
                Discover premium, safe, and adorable products for your little ones. From feeding essentials to cozy
                clothing, we've got you covered.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Link href="/products">
                  <Button
                    size="default"
                    className="rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 hover:shadow-lg group sm:size-lg"
                  >
                    Shop Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="default"
                  variant="outline"
                  className="rounded-full bg-transparent hover:bg-primary/5 hover:scale-105 transition-all duration-300 sm:size-lg"
                >
                  View Bestsellers
                </Button>
              </div>
            </div>
            <div className="relative animate-slide-in-right mt-4 lg:mt-0">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-3xl animate-pulse-soft" />
              <img
                src="/happy-baby-with-products.jpg"
                alt="Baby Products Hero"
                className="w-full h-auto rounded-2xl sm:rounded-3xl shadow-xl lg:shadow-2xl animate-float max-h-[300px] sm:max-h-[400px] lg:max-h-none object-cover"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="border-y border-border/40 bg-muted/20 py-4 sm:py-6 lg:py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-fade-in">
              <div className="flex items-center gap-2 sm:gap-3 group">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">Free Shipping</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Orders over ₹2000</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 group">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-secondary/50 group-hover:bg-secondary/70 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">Safe Products</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Certified & tested</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 group">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-accent/50 group-hover:bg-accent/70 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <HeadphonesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">24/7 Support</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">We're here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 group">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">Top Rated</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">5-star reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-8 sm:mb-10 lg:mb-12 text-center space-y-2 sm:space-y-3 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance">Shop by Category</h2>
            <p className="text-muted-foreground text-pretty">Find exactly what you need for your little one</p>
          </div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {[...Array(5)].map((_, index) => (
                <Card key={index} className="overflow-hidden rounded-2xl border-border/60 animate-pulse bg-gradient-to-br from-background to-muted/30 h-full p-0">
                  <div className="h-full flex flex-col">
                    <div className="aspect-square bg-muted/50" />
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories available at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Please check back later or contact support.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 stagger-fade-in">
                {categories.slice(0, 5).map((category, index) => (
                  <Link key={category.id} href={`/products?category=${category.id}`} className="group h-full">
                    <div className="animate-scale-in h-full" style={{ animationDelay: `${index * 100}ms` }}>
                      <Card className="group overflow-hidden rounded-2xl border-border/60 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 cursor-pointer bg-gradient-to-br from-background to-muted/30 h-full p-0">
                        <div className="h-full flex flex-col">
                          <div className="relative aspect-square overflow-hidden">
                            {category.image ? (
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover transition-all duration-700 group-hover:scale-110"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              />
                            ) : (
                              <div className={`h-full w-full ${category.color || 'bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10'} flex items-center justify-center`}>
                                {category.icon && (
                                  <div className="text-4xl opacity-30">{category.icon}</div>
                                )}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                                {category.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {category._count?.products || 0} {(category._count?.products || 0) === 1 ? 'item' : 'items'}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-primary font-medium text-xs group-hover:translate-x-1 transition-transform duration-300">
                              Shop Now
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* See More Categories Button */}
              {categories.length > 5 && (
                <div className="text-center mt-10">
                  <Link href="/products">
                    <Button variant="outline" className="rounded-full bg-transparent hover:bg-primary/5 hover:scale-105 transition-all duration-300 px-6 py-2">
                      See All Categories
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-muted/30 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-8 sm:mb-10 lg:mb-12 text-center space-y-2 sm:space-y-3 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance">Featured Products</h2>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty">Our most loved items this month</p>
          </div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="overflow-hidden rounded-3xl border-border/60 animate-pulse bg-gradient-to-br from-background to-muted/20 h-full p-0">
                  <div className="h-full flex flex-col">
                    <div className="aspect-square bg-muted/50" />
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-5 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured products available at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Please check back later for our latest featured items.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-fade-in">
              {featuredProducts.map((product, index) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group h-full">
                  <div className="animate-scale-in h-full" style={{ animationDelay: `${index * 100}ms` }}>
                    <Card className="group overflow-hidden rounded-3xl border-border/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-primary/30 relative cursor-pointer bg-gradient-to-br from-background to-muted/20 h-full p-0">
                      <div className="h-full flex flex-col">
                        <div className="relative aspect-square bg-muted/30 overflow-hidden">
                          {product.featured && (
                            <Badge className="absolute left-3 top-3 z-10 rounded-full bg-primary text-primary-foreground border-0 text-xs px-3 py-1.5 font-semibold">
                              Featured
                            </Badge>
                          )}
                          {product.salePrice && product.salePrice < product.price && (
                            <Badge className="absolute right-3 top-3 z-10 rounded-full bg-destructive text-destructive-foreground border-0 text-xs px-3 py-1.5 font-semibold">
                              {Math.round(((parseFloat(product.price) - parseFloat(product.salePrice)) / parseFloat(product.price)) * 100)}% OFF
                            </Badge>
                          )}
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="font-semibold">{product.rating || '4.5'}</span>
                                <span className="text-muted-foreground">({product.reviewCount || '0'})</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2 mt-4">
                            <p className="text-xl font-bold text-primary">
                              {formatCurrency(product.salePrice || product.price)}
                            </p>
                            {product.salePrice && product.salePrice < product.price && (
                              <p className="text-sm text-muted-foreground line-through">
                                {formatCurrency(product.price)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* See More Products Button */}
          {!loading && (
            <div className="text-center mt-12">
              <Link href="/products">
                <Button className="rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 hover:shadow-lg group px-8 py-3 text-base">
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Offers Carousel Section */}
      <OfferCarousel offers={offers} />

      <Footer />
    </div>
  )
}
