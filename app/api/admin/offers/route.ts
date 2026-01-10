import { NextRequest, NextResponse } from 'next/server'
import { getAllOffers, createOffer } from '@/lib/offers'
import { OfferType, DiscountType } from '@prisma/client'

// GET /api/admin/offers - Get all offers for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const offers = await getAllOffers({
      type: type || undefined,
      status: status || undefined
    })

    return NextResponse.json({ offers })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}

// POST /api/admin/offers - Create new offer
export async function POST(request: NextRequest) {
  try {
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

    if (!discountValue || discountValue < 0) {
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

    const offer = await createOffer({
      title,
      description,
      code: code || undefined,
      type,
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
      maxUses: maxUses ? parseInt(maxUses) : undefined,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      image: image || undefined,
      buttonText,
      buttonLink,
      priority: priority ? parseInt(priority) : undefined,
      isActive: isActive !== undefined ? isActive : true
    })

    return NextResponse.json(offer, { status: 201 })
  } catch (error: any) {
    console.error('Error creating offer:', error)
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    )
  }
}