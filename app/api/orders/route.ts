import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createOrder, getUserOrders } from '@/lib/db-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (userId) {
      const orders = await getUserOrders(userId)
      return NextResponse.json({ orders })
    }

    const where: any = {}
    if (status) where.status = status

    const orders = await db.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        payments: true,
        shipments: true,
        shippingAddress: true,
        billingAddress: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      items,
      shippingAddressId,
      billingAddressId,
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount
    } = body

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'User ID and items are required' },
        { status: 400 }
      )
    }

    if (!subtotal || subtotal <= 0) {
      return NextResponse.json(
        { error: 'Valid subtotal is required' },
        { status: 400 }
      )
    }

    const order = await createOrder({
      userId,
      items,
      shippingAddressId,
      billingAddressId,
      subtotal: parseFloat(subtotal),
      taxAmount: taxAmount ? parseFloat(taxAmount) : 0,
      shippingAmount: shippingAmount ? parseFloat(shippingAmount) : 0,
      discountAmount: discountAmount ? parseFloat(discountAmount) : 0
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}