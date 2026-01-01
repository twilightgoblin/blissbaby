import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log('Product API called with ID:', id)

    if (!id) {
      console.log('Product API: No ID provided')
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Get the product
    const product = await db.product.findUnique({
      where: { 
        id,
        status: 'ACTIVE'
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    })

    console.log('Product lookup:', { id, found: !!product })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get related products from the same category
    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        status: 'ACTIVE',
        id: { not: product.id }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      take: 3,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      product,
      relatedProducts
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}