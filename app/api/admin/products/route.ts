import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category && category !== 'all') {
      where.category = { name: category }
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.product.count({ where })
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      price,
      comparePrice,
      categoryId,
      brand,
      images,
      inventory,
      lowStock,
      sku,
      barcode,
      weight,
      dimensions,
      tags,
      featured,
      status,
      seoTitle,
      seoDescription
    } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      )
    }

    // Check if SKU already exists
    if (sku) {
      const existingSku = await db.product.findUnique({
        where: { sku }
      })
      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        )
      }
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        categoryId,
        brand,
        images: images || [],
        inventory: parseInt(inventory) || 0,
        lowStock: parseInt(lowStock) || 5,
        sku,
        barcode,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        tags: tags || [],
        featured: featured || false,
        status: status || 'ACTIVE',
        seoTitle,
        seoDescription
      },
      include: {
        category: true
      }
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