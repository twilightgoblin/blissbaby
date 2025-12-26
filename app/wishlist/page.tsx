"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

interface WishlistItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  inStock: boolean
  category: string
}

export default function WishlistPage() {
  // TODO: Replace with API call to fetch real wishlist items
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])

  // TODO: Add useEffect to fetch real wishlist items from API
  useEffect(() => {
    // fetchWishlistItems().then(setWishlistItems)
  }, [])

  const removeFromWishlist = (id: number) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id))
  }

  const moveAllToCart = () => {
    const inStockItems = wishlistItems.filter((item) => item.inStock)
    if (inStockItems.length > 0) {
      alert(`Added ${inStockItems.length} items to cart!`)
    }
  }

  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Wishlist</h1>
              <p className="text-muted-foreground">
                {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved for later
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <div className="flex gap-3">
                <Button onClick={moveAllToCart} className="rounded-full hover:scale-105 transition-all duration-300">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add All to Cart
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Wishlist Stats */}
        {wishlistItems.length > 0 && (
          <Card className="p-6 mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 animate-scale-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">${totalValue.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-foreground mb-1">
                  {wishlistItems.filter((item) => item.inStock).length}
                </div>
                <div className="text-sm text-muted-foreground">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive mb-1">
                  {wishlistItems.filter((item) => item.originalPrice).length}
                </div>
                <div className="text-sm text-muted-foreground">On Sale</div>
              </div>
            </div>
          </Card>
        )}

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <Card className="p-12 text-center animate-scale-in">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Start adding items you love to your wishlist!</p>
            <Link href="/products">
              <Button className="rounded-full hover:scale-105 transition-all duration-300">Browse Products</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 stagger-fade-in">
            {wishlistItems.map((item) => (
              <Card
                key={item.id}
                className="p-6 hover-lift hover:border-primary/30 transition-all duration-300 bg-card"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  <Link href={`/products/${item.id}`} className="relative w-full md:w-40 h-40 shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="rounded-xl object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {item.originalPrice && (
                      <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                        Sale
                      </div>
                    )}
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center">
                        <span className="text-sm font-semibold text-muted-foreground">Out of Stock</span>
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <Link
                            href={`/products/${item.id}`}
                            className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromWishlist(item.id)}
                          className="shrink-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium text-foreground">{item.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">({item.reviews} reviews)</span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</span>
                        {item.originalPrice && (
                          <>
                            <span className="text-lg text-muted-foreground line-through">
                              ${item.originalPrice.toFixed(2)}
                            </span>
                            <span className="text-sm font-semibold text-destructive">
                              Save ${(item.originalPrice - item.price).toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <Button
                        disabled={!item.inStock}
                        className="flex-1 rounded-full hover:scale-105 transition-all duration-300"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {item.inStock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                      <Link href={`/products/${item.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full rounded-full hover:scale-105 transition-all duration-300 bg-transparent"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {wishlistItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">You might also like</h2>
            <div className="text-center">
              <Link href="/products">
                <Button
                  variant="outline"
                  className="rounded-full hover:scale-105 transition-all duration-300 bg-transparent"
                >
                  Explore More Products
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
