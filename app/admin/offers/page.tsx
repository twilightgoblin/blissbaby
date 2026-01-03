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
import { Plus, Edit, Trash2, Tag, Calendar, TrendingUp, ImageIcon, Upload } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/image-upload"

interface Offer {
  id: string
  title: string
  description?: string
  code?: string
  type: 'DISCOUNT_CODE' | 'BANNER' | 'BOTH'
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  usageLimit?: number
  usageCount: number
  isActive: boolean
  startDate: string
  endDate?: string
  image?: string
  buttonText?: string
  buttonLink?: string
  position?: string
  priority: number
  createdAt: string
  updatedAt: string
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    type: 'BANNER' as const,
    discountType: 'PERCENTAGE' as const,
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    image: [] as string[],
    buttonText: 'Shop Now',
    buttonLink: '/products',
    priority: '0',
    isActive: true
  })

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/admin/offers')
      if (!response.ok) throw new Error('Failed to fetch offers')
      const data = await response.json()
      setOffers(data.offers || [])
    } catch (error) {
      console.error('Error fetching offers:', error)
      toast.error('Failed to fetch offers')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      code: '',
      type: 'BANNER',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      image: [],
      buttonText: 'Shop Now',
      buttonLink: '/products',
      priority: '0',
      isActive: true
    })
  }

  const handleCreate = async () => {
    if (!formData.title || !formData.discountValue || !formData.startDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: formData.image[0] || '' // Use first image or empty string
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create offer')
      }

      toast.success('Offer created successfully')
      setIsCreateDialogOpen(false)
      resetForm()
      fetchOffers()
    } catch (error: any) {
      console.error('Error creating offer:', error)
      toast.error(error.message || 'Failed to create offer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (offer: Offer) => {
    setSelectedOffer(offer)
    setFormData({
      title: offer.title,
      description: offer.description || '',
      code: offer.code || '',
      type: offer.type,
      discountType: offer.discountType,
      discountValue: offer.discountValue.toString(),
      minOrderAmount: offer.minOrderAmount?.toString() || '',
      maxDiscountAmount: offer.maxDiscountAmount?.toString() || '',
      usageLimit: offer.usageLimit?.toString() || '',
      startDate: offer.startDate.split('T')[0],
      endDate: offer.endDate ? offer.endDate.split('T')[0] : '',
      image: offer.image ? [offer.image] : [],
      buttonText: offer.buttonText || 'Shop Now',
      buttonLink: offer.buttonLink || '/products',
      priority: offer.priority.toString(),
      isActive: offer.isActive
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedOffer || !formData.title || !formData.discountValue || !formData.startDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/offers/${selectedOffer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: formData.image[0] || '' // Use first image or empty string
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update offer')
      }

      toast.success('Offer updated successfully')
      setIsEditDialogOpen(false)
      setSelectedOffer(null)
      resetForm()
      fetchOffers()
    } catch (error: any) {
      console.error('Error updating offer:', error)
      toast.error(error.message || 'Failed to update offer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (offer: Offer) => {
    if (!confirm('Are you sure you want to delete this offer?')) return

    try {
      const response = await fetch(`/api/admin/offers/${offer.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete offer')

      toast.success('Offer deleted successfully')
      fetchOffers()
    } catch (error) {
      console.error('Error deleting offer:', error)
      toast.error('Failed to delete offer')
    }
  }

  const toggleOfferStatus = async (offer: Offer) => {
    try {
      const response = await fetch(`/api/admin/offers/${offer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...offer, isActive: !offer.isActive })
      })

      if (!response.ok) throw new Error('Failed to update offer status')

      toast.success(`Offer ${!offer.isActive ? 'activated' : 'deactivated'}`)
      fetchOffers()
    } catch (error) {
      console.error('Error updating offer status:', error)
      toast.error('Failed to update offer status')
    }
  }

  const getOfferStatusBadge = (offer: Offer) => {
    const now = new Date()
    const startDate = new Date(offer.startDate)
    const endDate = offer.endDate ? new Date(offer.endDate) : null

    if (!offer.isActive) {
      return "bg-gray-100 text-gray-700 hover:bg-gray-100"
    }
    
    if (startDate > now) {
      return "bg-blue-100 text-blue-700 hover:bg-blue-100"
    }
    
    if (endDate && endDate < now) {
      return "bg-red-100 text-red-700 hover:bg-red-100"
    }
    
    return "bg-green-100 text-green-700 hover:bg-green-100"
  }

  const getOfferStatus = (offer: Offer) => {
    const now = new Date()
    const startDate = new Date(offer.startDate)
    const endDate = offer.endDate ? new Date(offer.endDate) : null

    if (!offer.isActive) return 'Inactive'
    if (startDate > now) return 'Scheduled'
    if (endDate && endDate < now) return 'Expired'
    return 'Active'
  }

  const formatDiscountValue = (offer: Offer) => {
    switch (offer.discountType) {
      case 'PERCENTAGE':
        return `${offer.discountValue}%`
      case 'FIXED_AMOUNT':
        return formatCurrency(offer.discountValue)
      case 'FREE_SHIPPING':
        return 'Free Shipping'
      default:
        return offer.discountValue.toString()
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-muted rounded w-64 animate-pulse" />
            <div className="h-4 bg-muted rounded w-48 mt-2 animate-pulse" />
          </div>
          <div className="h-10 bg-muted rounded-full w-32 animate-pulse" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-3xl border-border/60 animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-16 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offers & Banners</h1>
          <p className="text-muted-foreground mt-2">Create and manage promotional offers and banners</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Offer</DialogTitle>
              <DialogDescription>Set up a new promotional offer or banner</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter offer title"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANNER">Banner Only</SelectItem>
                      <SelectItem value="DISCOUNT_CODE">Discount Code Only</SelectItem>
                      <SelectItem value="BOTH">Banner + Discount Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the offer"
                  className="rounded-xl"
                  rows={3}
                />
              </div>

              {(formData.type === 'DISCOUNT_CODE' || formData.type === 'BOTH') && (
                <div className="space-y-2">
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                    className="rounded-xl"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select value={formData.discountType} onValueChange={(value: any) => setFormData({ ...formData, discountType: value })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage Discount</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Discount Value * {formData.discountType === 'PERCENTAGE' && '(%)'}
                    {formData.discountType === 'FIXED_AMOUNT' && '(₹)'}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountType === 'FREE_SHIPPING' ? '0' : formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: formData.discountType === 'FREE_SHIPPING' ? '0' : e.target.value })}
                    placeholder={formData.discountType === 'FREE_SHIPPING' ? '0' : '20'}
                    className="rounded-xl"
                    disabled={formData.discountType === 'FREE_SHIPPING'}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {(formData.type === 'BANNER' || formData.type === 'BOTH') && (
                <>
                  <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <ImageUpload
                      value={formData.image}
                      onChange={(urls) => setFormData({ ...formData, image: urls })}
                      maxImages={1}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="buttonText">Button Text</Label>
                      <Input
                        id="buttonText"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        placeholder="Shop Now"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buttonLink">Button Link</Label>
                      <Input
                        id="buttonLink"
                        value={formData.buttonLink}
                        onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                        placeholder="/products"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority (0-10)</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetForm()
                }}
                className="rounded-full bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={submitting}
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                {submitting ? 'Creating...' : 'Create Offer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Offers List */}
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
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {offer.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className={`rounded-full border-0 ${getOfferStatusBadge(offer)}`}>
                    {getOfferStatus(offer)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-muted/50 p-4">
                  <div className="flex-1">
                    {offer.code && (
                      <>
                        <p className="text-xs text-muted-foreground">Discount Code</p>
                        <p className="font-mono text-lg font-bold">{offer.code}</p>
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Discount</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatDiscountValue(offer)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(offer.startDate).toLocaleDateString()} - {' '}
                      {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'No end date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{offer.usageCount} times used</span>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-border/40 pt-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Switch
                      checked={offer.isActive}
                      onCheckedChange={() => toggleOfferStatus(offer)}
                    />
                    <Label className="text-sm">Active</Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(offer)}
                    className="rounded-full bg-transparent"
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(offer)}
                    className="rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-transparent"
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

      {offers.length === 0 && (
        <div className="text-center py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto mb-4">
            <Tag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No offers created yet</h3>
          <p className="text-muted-foreground mb-4">Create your first promotional offer or banner to get started.</p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-full bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Offer
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
            <DialogDescription>Update the promotional offer or banner</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Same form fields as create dialog */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter offer title"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANNER">Banner Only</SelectItem>
                    <SelectItem value="DISCOUNT_CODE">Discount Code Only</SelectItem>
                    <SelectItem value="BOTH">Banner + Discount Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the offer"
                className="rounded-xl"
                rows={3}
              />
            </div>

            {(formData.type === 'DISCOUNT_CODE' || formData.type === 'BOTH') && (
              <div className="space-y-2">
                <Label htmlFor="edit-code">Discount Code</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SAVE20"
                  className="rounded-xl"
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-discountType">Discount Type</Label>
                <Select value={formData.discountType} onValueChange={(value: any) => setFormData({ ...formData, discountType: value })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage Discount</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discountValue">
                  Discount Value * {formData.discountType === 'PERCENTAGE' && '(%)'}
                  {formData.discountType === 'FIXED_AMOUNT' && '(₹)'}
                </Label>
                <Input
                  id="edit-discountValue"
                  type="number"
                  value={formData.discountType === 'FREE_SHIPPING' ? '0' : formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: formData.discountType === 'FREE_SHIPPING' ? '0' : e.target.value })}
                  placeholder={formData.discountType === 'FREE_SHIPPING' ? '0' : '20'}
                  className="rounded-xl"
                  disabled={formData.discountType === 'FREE_SHIPPING'}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {(formData.type === 'BANNER' || formData.type === 'BOTH') && (
              <>
                <div className="space-y-2">
                  <Label>Banner Image</Label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(urls) => setFormData({ ...formData, image: urls })}
                    maxImages={1}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-buttonText">Button Text</Label>
                    <Input
                      id="edit-buttonText"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      placeholder="Shop Now"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-buttonLink">Button Link</Label>
                    <Input
                      id="edit-buttonLink"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      placeholder="/products"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority (0-10)</Label>
                  <Input
                    id="edit-priority"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedOffer(null)
                resetForm()
              }}
              className="rounded-full bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={submitting}
              className="rounded-full bg-primary hover:bg-primary/90"
            >
              {submitting ? 'Updating...' : 'Update Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}