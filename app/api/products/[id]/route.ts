import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ProductStatus } from '@prisma/client'
import { CachedQueries } from '@/lib/cache-wrapper'
import { CacheKeys, CacheTTL } from '@/lib/redis'
import { withCache } from '@/lib/cache-wrapper'

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

    // Validate ID format (CUID format check - starts with 'c' and is 25 characters long)
    if (!id.match(/^c[a-z0-9]{24}$/)) {
      console.log('Product API: Invalid ID format:', id)
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      )
    }

    // Use cache wrapper for product and related products
    const result = await withCache(
      CacheKeys.product(id),
      async () => {
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
          return null
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

        return { 
          product: {
            ...product,
            category: product.categories // Map categories to category for frontend compatibility
          },
          relatedProducts: relatedProducts.map(p => ({
            ...p,
            category: p.categories // Map categories to category for frontend compatibility
          }))
        }
      },
      CacheTTL.LONG // Cache individual products for 1 hour
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}