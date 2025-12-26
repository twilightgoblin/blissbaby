"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Tag, Calendar, TrendingUp, ImageIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function OffersPage() {
  // TODO: Replace with API calls to fetch real offers and banners
  const [offers, setOffers] = useState([])
  const [banners, setBanners] = useState([])

  // TODO: Add useEffect to fetch real offers and banners from API
  useEffect(() => {
    // fetchOffers().then(setOffers)
    // fetchBanners().then(setBanners)
  }, [])

  const getOfferStatusBadge = (status: string) => {
    const configs = {
      active: "bg-green-100 text-green-700 hover:bg-green-100",
      expired: "bg-red-100 text-red-700 hover:bg-red-100",
      scheduled: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    }
    return configs[status as keyof typeof configs]
  }

  const getBannerStatusBadge = (status: string) => {
    const configs = {
      active: "bg-green-100 text-green-700 hover:bg-green-100",
      inactive: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    }
    return configs[status as keyof typeof configs]
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Offers Section */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Offers & Discounts</h1>
            <p className="text-muted-foreground mt-2">Create and manage promotional offers</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle>Create New Offer</DialogTitle>
                <DialogDescription>Set up a new promotional offer or discount code</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="offer-title">Offer Title</Label>
                    <Input id="offer-title" placeholder="Enter offer title" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offer-code">Discount Code</Label>
                    <Input id="offer-code" placeholder="SAVE20" className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-description">Description</Label>
                  <Textarea id="offer-description" placeholder="Describe the offer" className="rounded-xl" rows={3} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="offer-type">Offer Type</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Discount</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offer-value">Discount Value</Label>
                    <Input id="offer-value" type="number" placeholder="20" className="rounded-xl" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" className="rounded-xl" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-full bg-transparent">
                  Cancel
                </Button>
                <Button className="rounded-full bg-primary hover:bg-primary/90">Create Offer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {offers.map((offer) => (
            <Card key={offer.id} className="rounded-3xl border-border/60 hover-lift">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Tag className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{offer.title}</h3>
                        <p className="text-sm text-muted-foreground">{offer.description}</p>
                      </div>
                    </div>
                    <Badge className={`rounded-full border-0 ${getOfferStatusBadge(offer.status)}`}>
                      {offer.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl bg-muted/50 p-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Discount Code</p>
                      <p className="font-mono text-lg font-bold">{offer.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Discount</p>
                      <p className="text-2xl font-bold text-primary">
                        {offer.type === "percentage"
                          ? `${offer.discount}%`
                          : offer.type === "fixed"
                            ? `$${offer.discount}`
                            : "Free"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {offer.startDate} - {offer.endDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>{offer.used} times used</span>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-border/40 pt-4">
                    <Button variant="outline" size="sm" className="flex-1 rounded-full bg-transparent">
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-transparent"
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Banners Section */}
      <div className="space-y-6 border-t border-border/40 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Promotional Banners</h2>
            <p className="text-muted-foreground mt-2">Manage promotional banners across the site</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle>Add New Banner</DialogTitle>
                <DialogDescription>Create a promotional banner for your store</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="banner-title">Banner Title</Label>
                  <Input id="banner-title" placeholder="Enter banner title" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner-position">Display Position</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home-hero">Home Hero</SelectItem>
                      <SelectItem value="products">Products Page</SelectItem>
                      <SelectItem value="cart">Cart Page</SelectItem>
                      <SelectItem value="checkout">Checkout Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Banner Image</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-muted/50 hover:bg-muted">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> banner image
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-full bg-transparent">
                  Cancel
                </Button>
                <Button className="rounded-full bg-primary hover:bg-primary/90">Add Banner</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {banners.map((banner) => (
            <Card key={banner.id} className="rounded-3xl border-border/60 hover-lift">
              <CardContent className="p-6 space-y-4">
                <div className="relative h-40 overflow-hidden rounded-2xl bg-muted/50">
                  <img
                    src={banner.image || "/placeholder.svg"}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{banner.title}</h3>
                    <Badge className={`rounded-full border-0 ${getBannerStatusBadge(banner.status)}`}>
                      {banner.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Position: {banner.position}</p>
                  <p className="text-sm text-muted-foreground">{banner.clicks} clicks</p>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-4">
                  <div className="flex items-center gap-2">
                    <Switch id={`banner-${banner.id}`} defaultChecked={banner.status === "active"} />
                    <Label htmlFor={`banner-${banner.id}`} className="text-sm">
                      Active
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
