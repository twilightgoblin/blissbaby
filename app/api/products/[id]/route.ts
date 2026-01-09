import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ProductStatus } from '@prisma/client'

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

    // Validate ID format (basic UUID check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      console.log('Product API: Invalid ID format:', id)
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      )
    }

    // Get the product
    const product = await db.products.findUnique({
      where: { 
        id,
        status: ProductStatus.ACTIVE
      },
      include: {
        categories: {
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
    const relatedProducts = await db.products.findMany({
      where: {
        categoryId: product.categoryId,
        status: ProductStatus.ACTIVE,
        id: { not: product.id }
      },
      include: {
        categories: {
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
      product: {
        ...product,
        category: product.categories // Map categories to category for frontend compatibility
      },
      relatedProducts: relatedProducts.map(p => ({
        ...p,
        category: p.categories // Map categories to category for frontend compatibility
      }))
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}