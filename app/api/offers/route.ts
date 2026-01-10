import { NextRequest, NextResponse } from 'next/server'
import { getActiveOffers } from '@/lib/offers'

// GET /api/offers - Get active offers for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const position = searchParams.get('position') || 'home-hero'

    const offers = await getActiveOffers(type || undefined, position)

    // Return only public fields
    const publicOffers = offers.map(offer => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      code: offer.code,
      type: offer.type,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minOrderAmount: offer.minOrderAmount,
      image: offer.image,
      buttonText: offer.buttonText,
      buttonLink: offer.buttonLink,
      priority: offer.priority,
      startDate: offer.startDate,
      endDate: offer.endDate
    }))

    return NextResponse.json({ offers: publicOffers })
  } catch (error) {
    console.error('Error fetching public offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}