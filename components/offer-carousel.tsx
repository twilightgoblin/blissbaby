"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

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
  const [progress, setProgress] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

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

  // Auto-play functionality with progress
  useEffect(() => {
    if (!isAutoPlaying || offers.length <= 1) return

    setProgress(0)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0
        }
        return prev + (100 / (autoPlayInterval / 50))
      })
    }, 50)

    const slideInterval = setInterval(nextSlide, autoPlayInterval)
    
    return () => {
      clearInterval(progressInterval)
      clearInterval(slideInterval)
    }
  }, [isAutoPlaying, nextSlide, autoPlayInterval, offers.length, currentIndex])

  // Pause auto-play on hover, resume on mouse leave
  const handleMouseEnter = () => {
    setIsAutoPlaying(false)
    setProgress(0)
  }
  const handleMouseLeave = () => setIsAutoPlaying(true)

  // Touch/swipe support
  const minSwipeDistance = 50

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
  if (!offers || offers.length === 0) return null

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
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="text-4xl font-bold text-primary animate-bounce-soft">
                    {formatDiscountValue(offer)}
                  </div>
                  {offer.code && (
                    <Badge variant="outline" className="text-sm font-mono bg-background/50 backdrop-blur-sm">
                      Code: {offer.code}
                    </Badge>
                  )}
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
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="text-4xl font-bold text-primary animate-bounce-soft">
                            {formatDiscountValue(offer)}
                          </div>
                          {offer.code && (
                            <Badge variant="outline" className="text-sm font-mono bg-background/50 backdrop-blur-sm">
                              Code: {offer.code}
                            </Badge>
                          )}
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

          {/* Dots Indicator with Progress */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "relative w-2 h-2 rounded-full transition-all duration-200 overflow-hidden",
                  index === currentIndex 
                    ? "bg-primary w-6" 
                    : "bg-background/50 hover:bg-background/70"
                )}
                aria-label={`Go to offer ${index + 1}`}
              >
                {index === currentIndex && isAutoPlaying && offers.length > 1 && (
                  <div 
                    className="absolute inset-0 bg-primary-foreground/30 transition-all duration-75 ease-linear"
                    style={{ 
                      width: `${progress}%`,
                      transformOrigin: 'left'
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}