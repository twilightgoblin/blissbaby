import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star, Truck, Shield, HeadphonesIcon, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const categories = [
    {
      name: "Baby Care",
      slug: "baby-care",
      image: "/baby-care-products.png",
      color: "bg-pink-100/80",
      description: "Essential care products",
    },
    {
      name: "Feeding",
      slug: "feeding",
      image: "/baby-feeding-bottles.jpg",
      color: "bg-blue-100/80",
      description: "Bottles, bibs & more",
    },
    {
      name: "Toys",
      slug: "toys",
      image: "/colorful-baby-toys.png",
      color: "bg-purple-100/80",
      description: "Fun & educational toys",
    },
    {
      name: "Clothing",
      slug: "clothing",
      image: "/assorted-baby-clothes.png",
      color: "bg-indigo-100/80",
      description: "Soft & comfy outfits",
    },
    {
      name: "Hygiene",
      slug: "hygiene",
      image: "/baby-hygiene-products.jpg",
      color: "bg-green-100/80",
      description: "Clean & safe products",
    },
  ]

  const featuredProducts = [
    {
      id: 1,
      name: "Organic Cotton Baby Onesie",
      price: 24.99,
      originalPrice: 34.99,
      rating: 4.8,
      reviews: 124,
      image: "/baby-onesie-organic-cotton.jpg",
      badge: "Bestseller",
    },
    {
      id: 2,
      name: "Silicone Baby Bottle Set",
      price: 34.99,
      rating: 4.9,
      reviews: 89,
      image: "/baby-bottle-silicone-set.jpg",
      badge: "New",
    },
    {
      id: 3,
      name: "Soft Plush Teddy Bear",
      price: 18.99,
      rating: 4.7,
      reviews: 156,
      image: "/soft-teddy-bear-baby-toy.jpg",
      badge: null,
    },
    {
      id: 4,
      name: "Natural Baby Skincare Kit",
      price: 42.99,
      rating: 4.9,
      reviews: 203,
      image: "/baby-skincare-natural-products.jpg",
      badge: "Popular",
    },
  ]

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-0 animate-scale-in">
                <Sparkles className="mr-1 h-3 w-3 animate-pulse" />
                New Collection 2024
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
                Everything Your Baby Needs, All in One Place
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                Discover premium, safe, and adorable products for your little ones. From feeding essentials to cozy
                clothing, we've got you covered.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 hover:shadow-lg group"
                  >
                    Shop Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full bg-transparent hover:bg-primary/5 hover:scale-105 transition-all duration-300"
                >
                  View Bestsellers
                </Button>
              </div>
            </div>
            <div className="relative animate-slide-in-right">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-3xl animate-pulse-soft" />
              <img
                src="/happy-baby-with-products.jpg"
                alt="Baby Products Hero"
                className="w-full h-auto rounded-3xl shadow-2xl animate-float"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="border-y border-border/40 bg-muted/20 py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-fade-in">
              <div className="flex items-center gap-3 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">Orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/50 group-hover:bg-secondary/70 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Shield className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Safe Products</p>
                  <p className="text-sm text-muted-foreground">Certified & tested</p>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/50 group-hover:bg-accent/70 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <HeadphonesIcon className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold">24/7 Support</p>
                  <p className="text-sm text-muted-foreground">We're here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Top Rated</p>
                  <p className="text-sm text-muted-foreground">5-star reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="mb-12 text-center space-y-3 animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">Shop by Category</h2>
          <p className="text-muted-foreground text-pretty">Find exactly what you need for your little one</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 stagger-fade-in">
          {categories.map((category, index) => (
            <Link key={category.slug} href={`/products?category=${category.slug}`}>
              <div className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <Card className="group overflow-hidden rounded-3xl border-border/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30 cursor-pointer">
                  <CardContent className="p-0">
                    <div className={`relative aspect-square ${category.color} overflow-hidden`}>
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-125 group-hover:rotate-2"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                        {category.description}
                      </p>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold group-hover:text-primary transition-colors duration-300">
                        {category.name}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center space-y-3 animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">Featured Products</h2>
            <p className="text-muted-foreground text-pretty">Our most loved items this month</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-fade-in">
            {featuredProducts.map((product, index) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <Card className="group overflow-hidden rounded-3xl border-border/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-primary/30 relative cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative aspect-square bg-muted/50 overflow-hidden">
                        {product.badge && (
                          <Badge className="absolute left-3 top-3 z-10 rounded-full bg-primary text-primary-foreground border-0 animate-bounce-soft">
                            {product.badge}
                          </Badge>
                        )}
                        {product.originalPrice && (
                          <Badge className="absolute right-3 top-3 z-10 rounded-full bg-destructive text-destructive-foreground border-0">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </Badge>
                        )}
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-125"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <div className="space-y-3 p-4">
                        <h3 className="font-semibold group-hover:text-primary transition-colors duration-300 text-balance">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="font-medium">{product.rating}</span>
                          </div>
                          <span className="text-muted-foreground">({product.reviews})</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-lg font-bold text-primary">${product.price}</p>
                          {product.originalPrice && (
                            <p className="text-sm text-muted-foreground line-through">${product.originalPrice}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      <section className="py-16 md:py-24 container mx-auto px-4 animate-fade-in-up">
        <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative hover:shadow-2xl transition-shadow duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-shimmer" />
          <CardContent className="p-0 relative">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="space-y-6 p-8 md:p-12 animate-slide-in-left">
                <Badge className="rounded-full bg-primary text-primary-foreground border-0 animate-pulse-soft">
                  Limited Time Offer
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">
                  Get 20% Off Your First Order
                </h2>
                <p className="text-muted-foreground text-pretty leading-relaxed">
                  Join thousands of happy parents and discover why BabyBliss is the trusted choice for baby essentials.
                  Use code <strong className="text-primary">WELCOME20</strong> at checkout.
                </p>
                <Link href="/products">
                  <Button
                    size="lg"
                    className="rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 hover:shadow-lg group"
                  >
                    Start Shopping{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="relative p-8 md:p-12 animate-slide-in-right">
                <img
                  src="/baby-products-collection.jpg"
                  alt="Baby Products Collection"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  )
}
