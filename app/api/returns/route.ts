import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return returns/refunds policy information
    const returnsInfo = {
      policy: {
        returnWindow: 30, // days
        refundWindow: 7, // days after return received
        conditions: [
          'Items must be in original condition',
          'Original packaging required',
          'Tags and labels must be attached',
          'No signs of wear or damage',
          'Hygiene products cannot be returned'
        ],
        process: [
          'Initiate return request within 30 days',
          'Print return label and pack item securely',
          'Drop off at courier or schedule pickup',
          'Refund processed within 7 business days after receipt'
        ]
      },
      eligibleCategories: [
        'Baby Clothing',
        'Toys & Development',
        'Nursery Furniture',
        'Baby Gear',
        'Books & Learning'
      ],
      nonEligibleCategories: [
        'Diapers & Wipes',
        'Baby Care & Health',
        'Bath Time',
        'Feeding (opened items)'
      ]
    }

    return NextResponse.json(returnsInfo)
  } catch (error) {
    console.error('Error fetching returns info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch returns information' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, items, reason, description } = body

    if (!orderId || !items || !reason) {
      return NextResponse.json(
        { error: 'Order ID, items, and reason are required' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Validate the order exists and belongs to the user
    // 2. Check if items are eligible for return
    // 3. Create return request in database
    // 4. Generate return label
    // 5. Send confirmation email

    const returnRequest = {
      id: `RET-${Date.now()}`,
      orderId,
      items,
      reason,
      description,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      estimatedRefund: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    }

    console.log('Return request created:', returnRequest)

    return NextResponse.json({
      success: true,
      returnRequest,
      message: 'Return request submitted successfully. You will receive a confirmation email shortly.'
    })
  } catch (error) {
    console.error('Error processing return request:', error)
    return NextResponse.json(
      { error: 'Failed to process return request' },
      { status: 500 }
    )
  }
}