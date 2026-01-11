import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params in Next.js 15+
    const { id } = await params

    // Get specific order with full details using Clerk user ID
    const order = await db.orders.findFirst({
      where: { 
        id,
        clerkUserId: user.id 
      },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                images: true,
              }
            }
          }
        },
        addresses_orders_shippingAddressIdToaddresses: true,
        addresses_orders_billingAddressIdToaddresses: true,
        payments: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Get order details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}