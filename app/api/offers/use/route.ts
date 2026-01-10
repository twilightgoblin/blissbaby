import { NextRequest, NextResponse } from 'next/server'
import { validateDiscountCode } from '@/lib/offers'

// POST /api/offers/use - Use a discount code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, orderAmount } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Discount code is required' },
        { status: 400 }
      )
    }

    if (!orderAmount || orderAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid order amount is required' },
        { status: 400 }
      )
    }

    const result = await validateDiscountCode(code, orderAmount)

    return NextResponse.json({
      valid: true,
      offer: {
        id: result.offer.id,
        title: result.offer.title,
        code: result.offer.code,
        discountType: result.offer.discountType,
        discountValue: result.offer.discountValue,
        discountAmount: result.discountAmount,
        freeShipping: result.freeShipping,
        minOrderAmount: result.offer.minOrderAmount
      }
    })
  } catch (error: any) {
    console.error('Error validating discount code:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to validate discount code' },
      { status: 400 }
    )
  }
}