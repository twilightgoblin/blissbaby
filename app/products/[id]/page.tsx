"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Star, Heart, Share2, Truck, Shield, ArrowLeft, Minus, Plus, Check } from "lucide-react"
import { useState } from "react"
import { useParams } from "next/navigation"

export default function ProductDetailPage() {
  const params = useParams()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  // Mock product data
  const product = {
    id: params.id,
    name: "Organic Cotton Baby Onesie",
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.8,
    reviews: 124,
    inStock: true,
    badge: "Bestseller",
    category: "Clothing",
    age: "0-6 months",
    images: ["/baby-onesie-organic-cotton.jpg", "/baby-onesie-organic-cotton.jpg", "/baby-onesie-organic-cotton.jpg"],
    features: [
      "100% Organic Cotton",
      "Hypoallergenic & Breathable",
      "Easy Snap Closures",
      "Machine Washable",
      "GOTS Certified",
    ],
    description:
      "Our premium organic cotton baby onesie is designed with your little one's comfort in mind. Made from the softest GOTS-certified organic cotton, this onesie is gentle on sensitive skin and perfect for everyday wear. The convenient snap closures make diaper changes quick and easy.",
  }

  const relatedProducts = [
    {
      id: 2,
      name: "Silicone Baby Bottle Set",
      price: 34.99,
      rating: 4.9,
      reviews: 89,
      image: "/baby-bottle-silicone-set.jpg",
    },
    {
      id: 3,
      name: "Soft Plush Teddy Bear",
      price: 18.99,
      rating: 4.7,
      reviews: 156,
      image: "/soft-teddy-bear-baby-toy.jpg",
    },
    {
      id: 7,
      name: "Muslin Swaddle Blankets",
      price: 29.99,
      rating: 4.8,
      reviews: 167,
      image: "/muslin-swaddle-blankets-pack.jpg",
    },
  ]

  const reviews = [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      date: "2 weeks ago",
      verified: true,
      comment:
        "Absolutely love this onesie! The fabric is so soft and my baby seems very comfortable in it. Worth every penny!",
      helpful: 12,
    },
    {
      id: 2,
      author: "Emily R.",
      rating: 5,
      date: "1 month ago",
      verified: true,
      comment: "Great quality organic cotton. Washes well and maintains its softness. Highly recommend!",
      helpful: 8,
    },
    {
      id: 3,
      author: "Jessica L.",
      rating: 4,
      date: "2 months ago",
      verified: true,
      comment: "Nice onesie, fits true to size. Only wish it came in more colors!",
      helpful: 5,
    },
  ]

  const ratingBreakdown = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 15 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ]

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <Button variant="ghost" className="mb-6 -ml-2 rounded-full hover:scale-105 transition-all duration-300" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        {/* Product Info */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4 animate-slide-in-left">
            <Card className="overflow-hidden rounded-3xl border-border/60 hover:shadow-xl transition-shadow duration-500">
              <CardContent className="p-0">
                <div className="relative aspect-square bg-muted/50">
                  {product.badge && (
                    <Badge className="absolute left-4 top-4 z-10 rounded-full bg-primary text-primary-foreground border-0 animate-bounce-soft">
                      {product.badge}
                    </Badge>
                  )}
                  <img
                    src={product.images[selectedImage] || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    selectedImage === index ? "border-primary shadow-lg" : "border-border/60 hover:border-border"
                  }`}
                >
                  <div className="aspect-square bg-muted/50">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6 animate-slide-in-right">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {product.category}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {product.age}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 transition-all duration-300 ${
                        i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
              )}
              {product.originalPrice && (
                <Badge className="rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 animate-pulse-soft">
                  Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold">Key Features:</h3>
              <ul className="space-y-2 stagger-fade-in">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 rounded-3xl border border-border/60 p-6 bg-muted/20 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Quantity:</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-transparent hover:scale-110 transition-all duration-300"
                    onClick={decrementQuantity}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-transparent hover:scale-110 transition-all duration-300"
                    onClick={incrementQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 rounded-full bg-primary hover:bg-primary/90 h-12 hover:scale-105 transition-all duration-300 hover:shadow-lg"
                  size="lg"
                  asChild
                >
                  <Link href="/cart">Add to Cart</Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-12 w-12 rounded-full transition-all duration-300 hover:scale-110 ${isFavorite ? "bg-primary/10 text-primary border-primary/20" : ""}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`h-5 w-5 transition-all duration-300 ${isFavorite ? "fill-primary" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-transparent hover:scale-110 transition-all duration-300"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {product.inStock ? (
                <div className="flex items-center gap-2 text-sm text-green-600 animate-fade-in">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">In Stock - Ships within 24 hours</span>
                </div>
              ) : (
                <div className="text-sm text-destructive">Out of Stock</div>
              )}
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 stagger-fade-in">
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 p-4 bg-card hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 p-4 bg-card hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50">
                  <Shield className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Safe & Tested</p>
                  <p className="text-xs text-muted-foreground">Certified products</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="reviews" className="mb-16 animate-fade-in-up">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 rounded-full bg-muted/50">
            <TabsTrigger
              value="reviews"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Reviews ({product.reviews})
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-8">
            <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
              {/* Rating Summary */}
              <Card className="rounded-3xl border-border/60 h-fit hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-5xl font-bold text-primary">{product.rating}</div>
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">Based on {product.reviews} reviews</p>
                  </div>
                  <div className="space-y-2">
                    {ratingBreakdown.map((item) => (
                      <div key={item.stars} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm">{item.stars}</span>
                          <Star className="h-3 w-3 fill-primary text-primary" />
                        </div>
                        <Progress value={item.percentage} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-12 text-right">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="space-y-6 stagger-fade-in">
                {reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="rounded-3xl border-border/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {review.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{review.author}</p>
                              {review.verified && (
                                <Badge variant="secondary" className="rounded-full text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{review.comment}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Button variant="ghost" size="sm" className="h-auto p-0 hover:text-primary transition-colors">
                          Helpful ({review.helpful})
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-8">
            <Card className="rounded-3xl border-border/60 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Product Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                  <dl className="grid gap-3">
                    <div className="flex justify-between border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium">{product.category}</dd>
                    </div>
                    <div className="flex justify-between border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">Age Range</dt>
                      <dd className="font-medium">{product.age}</dd>
                    </div>
                    <div className="flex justify-between border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">Material</dt>
                      <dd className="font-medium">100% Organic Cotton</dd>
                    </div>
                    <div className="flex justify-between border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">Care Instructions</dt>
                      <dd className="font-medium">Machine Washable</dd>
                    </div>
                    <div className="flex justify-between border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">Certification</dt>
                      <dd className="font-medium">GOTS Certified</dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        <section className="animate-fade-in-up">
          <h2 className="text-2xl font-bold tracking-tight mb-6">You May Also Like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-fade-in">
            {relatedProducts.map((relatedProduct) => (
              <Link href={`/products/${relatedProduct.id}`} key={relatedProduct.id}>
                <Card className="group overflow-hidden rounded-3xl border-border/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30">
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-muted/50 overflow-hidden">
                      <img
                        src={relatedProduct.image || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-2"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="space-y-3 p-4">
                      <h3 className="font-semibold group-hover:text-primary transition-colors duration-300 text-balance">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium">{relatedProduct.rating}</span>
                        </div>
                        <span className="text-muted-foreground">({relatedProduct.reviews})</span>
                      </div>
                      <p className="text-lg font-bold text-primary">${relatedProduct.price}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
