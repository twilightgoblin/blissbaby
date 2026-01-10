import { db } from './db'
import { OfferType, DiscountType } from '@prisma/client'

export interface CreateOfferData {
  title: string
  description?: string
  code?: string
  type: OfferType
  discountType: DiscountType
  discountValue: number
  minOrderAmount?: number
  maxUses?: number
  startDate: Date
  endDate?: Date
  image?: string
  buttonText?: string
  buttonLink?: string
  priority?: number
  isActive?: boolean
}

export interface UpdateOfferData extends Partial<CreateOfferData> {}

export async function getActiveOffers(type?: string, position?: string) {
  const now = new Date()
  
  let where: any = {
    isActive: true,
    startDate: { lte: now },
    OR: [
      { endDate: null },
      { endDate: { gte: now } }
    ]
  }

  // Filter by type if specified
  if (type && type !== 'all') {
    if (type === 'BANNER') {
      where.type = { in: ['BANNER', 'BOTH'] }
    } else {
      where.type = type.toUpperCase()
    }
  }

  // Filter by position
  if (position) {
    where.position = position
  }

  return await db.offers.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  })
}

export async function getAllOffers(filters?: {
  type?: string
  status?: string
}) {
  let where: any = {}

  if (filters?.type && filters.type !== 'all') {
    where.type = filters.type.toUpperCase()
  }

  if (filters?.status) {
    const now = new Date()
    switch (filters.status) {
      case 'active':
        where.isActive = true
        where.startDate = { lte: now }
        where.OR = [
          { endDate: null },
          { endDate: { gte: now } }
        ]
        break
      case 'inactive':
        where.isActive = false
        break
      case 'scheduled':
        where.isActive = true
        where.startDate = { gt: now }
        break
      case 'expired':
        where.endDate = { lt: now }
        break
    }
  }

  return await db.offers.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  })
}

export async function getOfferById(id: string) {
  return await db.offers.findUnique({
    where: { id }
  })
}

export async function createOffer(data: CreateOfferData) {
  return await db.offers.create({
    data: {
      ...data,
      priority: data.priority || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      buttonText: data.buttonText || 'Shop Now',
      buttonLink: data.buttonLink || '/products'
    }
  })
}

export async function updateOffer(id: string, data: UpdateOfferData) {
  return await db.offers.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  })
}

export async function deleteOffer(id: string) {
  // Check if offer has been used
  const offer = await db.offers.findUnique({
    where: { id }
  })

  if (!offer) {
    throw new Error('Offer not found')
  }

  if (offer.usedCount > 0) {
    // Instead of deleting, mark as inactive
    return await db.offers.update({
      where: { id },
      data: { 
        isActive: false,
        endDate: new Date()
      }
    })
  }

  // Delete if not used
  return await db.offers.delete({
    where: { id }
  })
}

export async function validateDiscountCode(code: string, orderAmount: number) {
  const now = new Date()
  
  const offer = await db.offers.findUnique({
    where: { code: code.toUpperCase() }
  })

  if (!offer) {
    throw new Error('Invalid discount code')
  }

  // Check if offer is active and within date range
  if (!offer.isActive) {
    throw new Error('This discount code is no longer active')
  }

  if (offer.startDate > now) {
    throw new Error('This discount code is not yet active')
  }

  if (offer.endDate && offer.endDate < now) {
    throw new Error('This discount code has expired')
  }

  // Check usage limits
  if (offer.maxUses && offer.usedCount >= offer.maxUses) {
    throw new Error('This discount code has reached its usage limit')
  }

  // Check minimum order amount
  if (offer.minOrderAmount && orderAmount < offer.minOrderAmount) {
    throw new Error(`Minimum order amount of ₹${offer.minOrderAmount} required for this discount`)
  }

  // Calculate discount amount
  let discountAmount = 0
  switch (offer.discountType) {
    case 'PERCENTAGE':
      discountAmount = (orderAmount * parseFloat(offer.discountValue.toString())) / 100
      break
    case 'FIXED_AMOUNT':
      discountAmount = parseFloat(offer.discountValue.toString())
      break
    case 'FREE_SHIPPING':
      discountAmount = 0 // Free shipping doesn't reduce order total
      break
    default:
      discountAmount = 0
  }

  // Ensure discount doesn't exceed order amount
  discountAmount = Math.min(discountAmount, orderAmount)

  return {
    offer,
    discountAmount,
    freeShipping: offer.discountType === 'FREE_SHIPPING'
  }
}

export async function incrementOfferUsage(id: string) {
  return await db.offers.update({
    where: { id },
    data: {
      usedCount: {
        increment: 1
      }
    }
  })
}

export async function getOfferStats() {
  const offers = await db.offers.findMany()
  const now = new Date()

  return {
    total: offers.length,
    active: offers.filter(o => 
      o.isActive && 
      o.startDate <= now && 
      (!o.endDate || o.endDate >= now)
    ).length,
    scheduled: offers.filter(o => 
      o.isActive && o.startDate > now
    ).length,
    expired: offers.filter(o => 
      o.endDate && o.endDate < now
    ).length,
    totalUsage: offers.reduce((sum, o) => sum + o.usedCount, 0)
  }
}