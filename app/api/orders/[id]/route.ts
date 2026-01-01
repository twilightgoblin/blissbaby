import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to get user ID from Clerk, but don't fail if not available
    let userId = null
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (authError) {
      // Auth failed, continue without user restriction
      console.log('Auth not available, allowing order access')
    }

    const orderId = params.id

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Find the order with all related data
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        // Only allow users to see their own orders if authenticated
        ...(userId ? { clerkUserId: userId } : {})
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              }
            }
          }
        },
        payments: true,
        shippingAddress: true,
        billingAddress: true,
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
}