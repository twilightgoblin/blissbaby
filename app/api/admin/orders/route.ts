import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAccess } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  // Verify admin access
  const authResult = await requireAdminAccess()
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let where: any = {}

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    try {
      const [orders, total] = await Promise.all([
        db.orders.findMany({
          where,
          include: {
            order_items: {
              include: {
                products: {
                  select: {
                    id: true,
                    name: true,
                    images: true
                  }
                }
              }
            },
            payments: true,
            addresses_orders_shippingAddressIdToaddresses: true,
            addresses_orders_billingAddressIdToaddresses: true,
            shipments: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        db.orders.count({ where })
      ])

      return NextResponse.json({
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (prismaError) {
      console.log('Prisma failed, using fallback for orders:', prismaError)
      
      // Return empty orders list as fallback
      return NextResponse.json({
        orders: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      })
    }
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    const updatedOrder = await db.orders.update({
      where: { id: orderId },
      data: { 
        status: status.toUpperCase(),
        updatedAt: new Date()
      },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        },
        payments: true,
        addresses_orders_shippingAddressIdToaddresses: true,
        addresses_orders_billingAddressIdToaddresses: true
      }
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}