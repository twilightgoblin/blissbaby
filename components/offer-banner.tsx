"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

interface Offer {
  id: string
  title: string
  description?: string
  code?: string
  type: 'DISCOUNT_CODE' | 'BANNER' | 'BOTH'
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  discountValue: number
  image?: string
  buttonText?: string
  buttonLink?: string
}

interface OfferBannerProps {
  offer: Offer
  className?: string
}

export function OfferBanner({ offer, className = "" }: OfferBannerProps) {
  const formatDiscountValue = (offer: Offer) => {
    switch (offer.discountType) {
      case 'PERCENTAGE':
        return `${offer.discountValue}% Off`
      case 'FIXED_AMOUNT':
        return `${formatCurrency(offer.discountValue)} Off`
      case 'FREE_SHIPPING':
        return 'Free Shipping'
      default:
        return `${offer.discountValue}% Off`
    }
  }

  const getDiscountText = (offer: Offer) => {
    switch (offer.discountType) {
      case 'PERCENTAGE':
        return `Get ${offer.discountValue}% Off`
      case 'FIXED_AMOUNT':
        return `Save ${formatCurrency(offer.discountValue)}`
      case 'FREE_SHIPPING':
        return 'Free Shipping'
      default:
        return `Get ${offer.discountValue}% Off`
    }
  }

  return (
    <section className={`py-16 md:py-24 container mx-auto px-4 animate-fade-in-up ${className}`}>
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative hover:shadow-2xl transition-shadow duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-shimmer" />
        <CardContent className="p-0 relative">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-6 p-8 md:p-12 animate-slide-in-left">
              <Badge className="rounded-full bg-primary text-primary-foreground border-0 animate-pulse-soft">
                <Sparkles className="mr-1 h-3 w-3" />
                Limited Time Offer
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">
                {offer.title}
              </h2>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                {offer.description}
                {offer.code && (
                  <>
                    {' '}Use code <strong className="text-primary">{offer.code}</strong> at checkout.
                  </>
                )}
              </p>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary">
                  {formatDiscountValue(offer)}
                </div>
                {offer.discountType === 'PERCENTAGE' && (
                  <div className="text-sm text-muted-foreground">
                    on your order
                  </div>
                )}
              </div>
              <Link href={offer.buttonLink || '/products'}>
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 hover:shadow-lg group"
                >
                  {offer.buttonText || 'Shop Now'}{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="relative p-8 md:p-12 animate-slide-in-right">
              {offer.image ? (
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              ) : (
                <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center shadow-xl">
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-bold text-primary/60">
                      {formatDiscountValue(offer)}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {offer.title}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}