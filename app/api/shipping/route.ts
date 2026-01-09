import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return shipping information
    const shippingInfo = {
      policies: [
        {
          id: 'standard',
          name: 'Standard Shipping',
          description: 'Free shipping on orders over ₹500',
          cost: 0,
          minOrder: 500,
          deliveryTime: '3-5 business days',
          available: true
        },
        {
          id: 'express',
          name: 'Express Shipping',
          description: 'Fast delivery within 1-2 business days',
          cost: 99,
          minOrder: 0,
          deliveryTime: '1-2 business days',
          available: true
        },
        {
          id: 'overnight',
          name: 'Overnight Shipping',
          description: 'Next day delivery',
          cost: 199,
          minOrder: 0,
          deliveryTime: 'Next business day',
          available: true
        }
      ],
      zones: [
        {
          name: 'Metro Cities',
          cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'],
          standardDays: '2-3',
          expressDays: '1-2'
        },
        {
          name: 'Tier 2 Cities',
          cities: ['Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur'],
          standardDays: '3-4',
          expressDays: '2-3'
        },
        {
          name: 'Other Areas',
          cities: ['All other locations'],
          standardDays: '4-7',
          expressDays: '3-5'
        }
      ]
    }

    return NextResponse.json(shippingInfo)
  } catch (error) {
    console.error('Error fetching shipping info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping information' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, address, shippingMethod } = body

    // Calculate shipping cost based on items and address
    let shippingCost = 0
    const totalValue = items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0

    switch (shippingMethod) {
      case 'standard':
        shippingCost = totalValue >= 500 ? 0 : 50
        break
      case 'express':
        shippingCost = 99
        break
      case 'overnight':
        shippingCost = 199
        break
      default:
        shippingCost = 50
    }

    return NextResponse.json({
      shippingCost,
      estimatedDelivery: getEstimatedDelivery(shippingMethod, address?.city),
      method: shippingMethod
    })
  } catch (error) {
    console.error('Error calculating shipping:', error)
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    )
  }
}

function getEstimatedDelivery(method: string, city?: string) {
  const today = new Date()
  let days = 3

  switch (method) {
    case 'overnight':
      days = 1
      break
    case 'express':
      days = 2
      break
    case 'standard':
      days = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'].includes(city || '') ? 3 : 5
      break
  }

  const deliveryDate = new Date(today)
  deliveryDate.setDate(today.getDate() + days)
  
  return deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}