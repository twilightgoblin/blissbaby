"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Star, Heart, Share2, Truck, Shield, ArrowLeft, Minus, Plus, Check, ShoppingCart } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: string
  comparePrice?: string
  salePrice?: string
  images?: string[]
  description?: string
  category?: {
    name: string
  }
  brand?: string
  sku?: string
  weight?: string
  inventory: number
  lowStock?: number
  featured?: boolean
  tags?: string[]
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const { addToCart, loading: cartLoading } = useCart()
  
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [productId, setProductId] = useState<string | null>(null)

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${productId}`)
        
        if (!response.ok) {
          throw new Error('Product not found')
        }
        
        const data = await response.json()
        setProduct(data.product)
        setRelatedProducts(data.relatedProducts || [])
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!isSignedIn || !user) {
      toast.error("Please sign in to add items to your cart")
      return
    }

    // Check if product is in stock
    if (!product || product.inventory <= 0) {
      toast.error("This product is out of stock")
      return
    }

    try {
      setAddingToCart(true)
      await addToCart(product.id, quantity)
      toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error("Failed to add item to cart. Please try again.")
    } finally {
      setAddingToCart(false)
    }
  }

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6" />
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-3xl" />
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted rounded-2xl" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-6 bg-muted rounded w-1/4" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/products">Back to Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

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
                  {product.featured && (
                    <Badge className="absolute left-4 top-4 z-10 rounded-full bg-primary text-primary-foreground border-0 animate-bounce-soft">
                      Featured
                    </Badge>
                  )}
                  {product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (
                    <Badge className="absolute right-4 top-4 z-10 rounded-full bg-destructive text-destructive-foreground border-0">
                      {Math.round(((parseFloat(product.comparePrice) - parseFloat(product.price)) / parseFloat(product.comparePrice)) * 100)}% OFF
                    </Badge>
                  )}
                  <img
                    src={product.images?.[selectedImage] || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </CardContent>
            </Card>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {product.images.slice(0, 3).map((image, index) => (
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
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6 animate-slide-in-right">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {product.category && (
                  <Badge variant="secondary" className="rounded-full">
                    {product.category.name}
                  </Badge>
                )}
                {product.brand && (
                  <Badge variant="outline" className="rounded-full">
                    {product.brand}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 transition-all duration-300 ${
                        i < 4 ? "fill-primary text-primary" : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">4.5</span>
                <span className="text-muted-foreground">(0 reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">{formatCurrency(parseFloat(product.price))}</span>
              {product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (
                <>
                  <span className="text-xl text-muted-foreground line-through">{formatCurrency(parseFloat(product.comparePrice))}</span>
                  <Badge className="rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 animate-pulse-soft">
                    Save {Math.round(((parseFloat(product.comparePrice) - parseFloat(product.price)) / parseFloat(product.comparePrice)) * 100)}%
                  </Badge>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Key Features */}
            <div className="space-y-3">
              <h3 className="font-semibold">Key Features:</h3>
              <ul className="space-y-2 stagger-fade-in">
                <li className="flex items-center gap-2 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  High-quality materials
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  Safe for babies
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  Easy to clean
                </li>
                {product.tags && product.tags.length > 0 && product.tags.map((tag, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {tag}
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
                  onClick={handleAddToCart}
                  disabled={addingToCart || cartLoading || !product || product.inventory <= 0}
                >
                  {addingToCart ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </>
                  )}
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

              {product.inventory > 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-600 animate-fade-in">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">
                    {product.inventory <= (product.lowStock || 5)
                      ? `Only ${product.inventory} left in stock!` 
                      : 'In Stock - Ships within 24 hours'
                    }
                  </span>
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
                  <p className="text-xs text-muted-foreground">On orders over ₹2000</p>
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

        {/* Product Details Section */}
        <div className="mb-16 animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Product Details</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
          </div>

          <Card className="rounded-3xl border-border/60 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  Product Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  Specifications
                </h3>
                <dl className="grid gap-3">
                  {product.category && (
                    <div className="flex justify-between border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium">{product.category.name}</dd>
                      </div>
                    )}
                    {product.brand && (
                      <div className="flex justify-between border-b border-border/60 pb-2">
                        <dt className="text-muted-foreground">Brand</dt>
                        <dd className="font-medium">{product.brand}</dd>
                      </div>
                    )}
                    {product.sku && (
                      <div className="flex justify-between border-b border-border/60 pb-2">
                        <dt className="text-muted-foreground">SKU</dt>
                        <dd className="font-medium">{product.sku}</dd>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between border-b border-border/60 pb-2">
                        <dt className="text-muted-foreground">Weight</dt>
                        <dd className="font-medium">{product.weight} kg</dd>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium">
                        <Badge variant={product.inventory > 0 ? "default" : "destructive"}>
                          {product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="animate-fade-in-up">
            <h2 className="text-2xl font-bold tracking-tight mb-6">You May Also Like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-fade-in">
              {relatedProducts.map((relatedProduct) => (
                <Link href={`/products/${relatedProduct.id}`} key={relatedProduct.id}>
                  <Card className="group overflow-hidden rounded-3xl border-border/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30">
                    <CardContent className="p-0">
                      <div className="relative aspect-square bg-muted/50 overflow-hidden">
                        <img
                          src={relatedProduct.images?.[0] || "/placeholder.svg"}
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
                            <span className="font-medium">4.5</span>
                          </div>
                          <span className="text-muted-foreground">(0)</span>
                        </div>
                        <p className="text-lg font-bold text-primary">{formatCurrency(parseFloat(relatedProduct.price))}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
