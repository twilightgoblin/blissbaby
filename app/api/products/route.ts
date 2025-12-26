import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getActiveProducts, createProduct } from '@/lib/db-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    let products

    if (category || featured) {
      const where: any = { status: 'ACTIVE' }
      if (category) where.category = category
      if (featured === 'true') where.featured = true

      products = await db.product.findMany({
        where,
        take: limit ? parseInt(limit) : undefined,
        orderBy: { createdAt: 'desc' }
      })
    } else {
      products = await getActiveProducts(limit ? parseInt(limit) : undefined)
    }

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