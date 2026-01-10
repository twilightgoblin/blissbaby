import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { OfferType, DiscountType } from '@prisma/client'

// GET /api/admin/offers/[id] - Get single offer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const offer = await db.offers.findUnique({
      where: { id }
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(offer)
  } catch (error) {
    console.error('Error fetching offer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offer' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/offers/[id] - Update offer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      title,
      description,
      code,
      type,
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      startDate,
      endDate,
      image,
      buttonText,
      buttonLink,
      priority,
      isActive
    } = body

    // Check if offer exists
    const existingOffer = await db.offers.findUnique({
      where: { id }
    })

    if (!existingOffer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!type || !Object.values(OfferType).includes(type)) {
      return NextResponse.json(
        { error: 'Valid offer type is required' },
        { status: 400 }
      )
    }

    if (!discountType || !Object.values(DiscountType).includes(discountType)) {
      return NextResponse.json(
        { error: 'Valid discount type is required' },
        { status: 400 }
      )
    }

    if (!discountValue || discountValue <= 0) {
      return NextResponse.json(
        { error: 'Valid discount value is required' },
        { status: 400 }
      )
    }

    if (!startDate) {
      return NextResponse.json(
        { error: 'Start date is required' },
        { status: 400 }
      )
    }

    // Check if code already exists (if provided and different from current)
    if (code && code !== existingOffer.code) {
      const codeExists = await db.offers.findUnique({
        where: { code }
      })
      if (codeExists) {
        return NextResponse.json(
          { error: 'Discount code already exists' },
          { status: 409 }
        )
      }
    }

    const offer = await db.offers.update({
      where: { id },
      data: {
        title,
        description,
        code: code || null,
        type,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        image: image || null,
        buttonText: buttonText || 'Shop Now',
        buttonLink: buttonLink || '/products',
        priority: priority ? parseInt(priority) : 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(offer)
  } catch (error: any) {
    console.error('Error updating offer:', error)
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/offers/[id] - Delete offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if offer exists
    const existingOffer = await db.offers.findUnique({
      where: { id }
    })

    if (!existingOffer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Check if offer has been used (has usedCount > 0)
    if (existingOffer.usedCount > 0) {
      // Instead of deleting, mark as inactive
      await db.offers.update({
        where: { id },
        data: { 
          isActive: false,
          endDate: new Date() // Set end date to now
        }
      })
      
      return NextResponse.json({ 
        message: 'Offer deactivated successfully (cannot delete used offers)' 
      })
    }

    // Delete the offer if it hasn't been used
    await db.offers.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Offer deleted successfully' })
  } catch (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json(
      { error: 'Failed to delete offer' },
      { status: 500 }
    )
  }
}