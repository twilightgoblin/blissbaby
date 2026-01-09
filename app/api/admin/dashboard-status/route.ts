import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      productCount,
      orderCount,
      categoryCount,
      sampleOrder,
      sampleProduct
    ] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.categories.count(),
      db.order.findFirst({
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      }),
      db.product.findFirst({
        include: {
          category: true
        }
      })
    ])

    return NextResponse.json({
      status: 'success',
      data: {
        productCount,
        orderCount,
        categoryCount,
        hasData: productCount > 0 || orderCount > 0,
        sampleOrder: sampleOrder ? {
          id: sampleOrder.id,
          orderNumber: sampleOrder.orderNumber,
          totalAmount: sampleOrder.totalAmount,
          status: sampleOrder.status,
          itemCount: sampleOrder.items.length
        } : null,
        sampleProduct: sampleProduct ? {
          id: sampleProduct.id,
          name: sampleProduct.name,
          price: sampleProduct.price,
          category: sampleProduct.category?.name
        } : null
      }
    })
  } catch (error) {
    console.error('Error checking dashboard status:', error)
    return NextResponse.json(
      { error: 'Failed to check dashboard status' },
      { status: 500 }
    )
  }
}