import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getActiveProducts, createProduct } from '@/lib/db-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search')

    const where: any = { status: 'ACTIVE' }
    
    // Category filter
    if (category) {
      where.categoryId = category
    }
    
    // Featured filter
    if (featured === 'true') {
      where.featured = true
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    switch (sortBy) {
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'popular':
        // For now, use featured products first, then by creation date
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }]
        break
      default:
        orderBy = { [sortBy]: sortOrder }
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      take: limit ? parseInt(limit) : undefined,
      orderBy
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, category, brand, images, inventory, sku } = body

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      )
    }

    const product = await createProduct({
      name,
      description,
      price: parseFloat(price),
      category,
      brand,
      images: images || [],
      inventory: inventory || 0,
      sku
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}