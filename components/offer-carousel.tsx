"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Offer {
  id: string
  title: string
  description?: string
  code?: string
  type: 'BANNER' | 'BOTH'
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  discountValue: number
  image?: string
  buttonText?: string
  buttonLink?: string
}

interface OfferCarouselProps {
  offers: Offer[]
  className?: string
  autoPlayInterval?: number
}

export function OfferCarousel({ 
  offers, 
  className = "", 
  autoPlayInterval = 4000 
}: OfferCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

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

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success(`Discount code "${code}" copied to clipboard!`)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      toast.error('Failed to copy discount code')
    }
  }

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === offers.length - 1 ? 0 : prevIndex + 1
    )
  }, [offers.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? offers.length - 1 : prevIndex - 1
    )
  }, [offers.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Auto-play functionality - simplified and working
  useEffect(() => {
    if (!isAutoPlaying || offers.length <= 1) {
      return
    }
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex === offers.length - 1 ? 0 : prevIndex + 1
        return nextIndex
      })
    }, autoPlayInterval)
    
    return () => {
      clearInterval(interval)
    }
  }, [isAutoPlaying, autoPlayInterval, offers.length])

  // Pause auto-play on hover, resume on mouse leave
  const handleMouseEnter = () => {
    setIsAutoPlaying(false)
  }
  
  const handleMouseLeave = () => {
    setIsAutoPlaying(true)
  }

  // Touch/swipe support
  const minSwipeDistance = 50
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevSlide()
      } else if (event.key === 'ArrowRight') {
        nextSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  // Don't render if no offers
  if (!offers || offers.length === 0) {
    return null
  }

  // Single offer - render without carousel
  if (offers.length === 1) {
    const offer = offers[0]
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
                </p>
                
                {/* Discount Code Section - Only for BOTH type offers */}
                {offer.code && offer.type === 'BOTH' && (
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Use Discount Code</p>
                      <div 
                        className="bg-background rounded-xl px-4 py-3 border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/50 transition-colors group"
                        onClick={() => copyToClipboard(offer.code!)}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-2xl font-bold font-mono text-primary tracking-wider">
                            {offer.code}
                          </p>
                          {copiedCode === offer.code ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Click to copy • Use at checkout</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="text-4xl font-bold text-primary animate-bounce-soft">
                    {formatDiscountValue(offer)}
                  </div>
                </div>
                <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <Link href={offer.buttonLink || '/products'}>
                    {offer.buttonText || 'Shop Now'}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
              {offer.image && (
                <div className="relative h-64 md:h-80 lg:h-96 animate-slide-in-right">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover rounded-2xl"
                    priority
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  // Multiple offers - render carousel
  return (
    <section 
      className={`py-16 md:py-24 container mx-auto px-4 animate-fade-in-up ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative">
        <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative hover:shadow-2xl transition-shadow duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-shimmer" />
          
          {/* Carousel Content */}
          <CardContent className="p-0 relative">
            <div 
              className="relative overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {offers.map((offer, index) => (
                  <div key={offer.id} className="w-full flex-shrink-0">
                    <div className="grid gap-8 lg:grid-cols-2 items-center">
                      <div className="space-y-6 p-8 md:p-12">
                        <Badge className="rounded-full bg-primary text-primary-foreground border-0 animate-pulse-soft">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Limited Time Offer
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">
                          {offer.title}
                        </h2>
                        <p className="text-muted-foreground text-pretty leading-relaxed">
                          {offer.description}
                        </p>
                        
                        {/* Discount Code Section - Only for BOTH type offers */}
                        {offer.code && offer.type === 'BOTH' && (
                          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
                            <div className="text-center space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Use Discount Code</p>
                              <div 
                                className="bg-background rounded-xl px-4 py-3 border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/50 transition-colors group"
                                onClick={() => copyToClipboard(offer.code!)}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <p className="text-2xl font-bold font-mono text-primary tracking-wider">
                                    {offer.code}
                                  </p>
                                  {copiedCode === offer.code ? (
                                    <Check className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">Click to copy • Use at checkout</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="text-4xl font-bold text-primary animate-bounce-soft">
                            {formatDiscountValue(offer)}
                          </div>
                        </div>
                        <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group">
                          <Link href={offer.buttonLink || '/products'}>
                            {offer.buttonText || 'Shop Now'}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                      {offer.image && (
                        <div className="relative h-64 md:h-80 lg:h-96">
                          <Image
                            src={offer.image}
                            alt={offer.title}
                            fill
                            className="object-cover rounded-2xl"
                            priority={index === 0}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
            aria-label="Previous offer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
            aria-label="Next offer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {offers.map((offer, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-200",
                    index === currentIndex 
                      ? "bg-primary w-6" 
                      : "bg-background/50 hover:bg-background/70"
                  )}
                  aria-label={`Go to offer ${index + 1}${offer.code && offer.type === 'BOTH' ? ` (Code: ${offer.code})` : ''}`}
                  title={offer.code && offer.type === 'BOTH' ? `${offer.title} - Code: ${offer.code}` : offer.title}
                />
                {/* Small indicator for BOTH type offers with discount codes */}
                {offer.code && offer.type === 'BOTH' && (
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full border border-background"></div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}