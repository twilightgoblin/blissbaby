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

    try {
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
    } catch (prismaError) {
      console.log('Prisma failed, using raw SQL fallback for products:', prismaError)
      
      // Fallback with raw SQL
      const { Pool } = await import('pg')
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        ssl: { rejectUnauthorized: false }
      })
      
      const client = await pool.connect()
      
      // Build SQL query
      let sqlQuery = `
        SELECT p.*, c.name as category_name, c.color as category_color, c.id as category_id
        FROM products p
        LEFT JOIN categories c ON p."categoryId" = c.id
        WHERE p.status = 'ACTIVE'
      `
      const queryParams: any[] = []
      let paramIndex = 1
      
      if (category) {
        sqlQuery += ` AND p."categoryId" = $${paramIndex}`
        queryParams.push(category)
        paramIndex++
      }
      
      if (featured === 'true') {
        sqlQuery += ` AND p.featured = true`
      }
      
      if (minPrice) {
        sqlQuery += ` AND p.price >= $${paramIndex}`
        queryParams.push(parseFloat(minPrice))
        paramIndex++
      }
      
      if (maxPrice) {
        sqlQuery += ` AND p.price <= $${paramIndex}`
        queryParams.push(parseFloat(maxPrice))
        paramIndex++
      }
      
      if (search) {
        sqlQuery += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex})`
        queryParams.push(`%${search}%`)
        paramIndex++
      }
      
      // Add sorting
      switch (sortBy) {
        case 'price-low':
          sqlQuery += ` ORDER BY p.price ASC`
          break
        case 'price-high':
          sqlQuery += ` ORDER BY p.price DESC`
          break
        case 'name':
          sqlQuery += ` ORDER BY p.name ASC`
          break
        case 'newest':
          sqlQuery += ` ORDER BY p."createdAt" DESC`
          break
        case 'popular':
          sqlQuery += ` ORDER BY p.featured DESC, p."createdAt" DESC`
          break
        default:
          sqlQuery += ` ORDER BY p."createdAt" DESC`
      }
      
      if (limit) {
        sqlQuery += ` LIMIT $${paramIndex}`
        queryParams.push(parseInt(limit))
      }
      
      const result = await client.query(sqlQuery, queryParams)
      
      client.release()
      await pool.end()
      
      // Format products data
      const products = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        comparePrice: row.comparePrice ? parseFloat(row.comparePrice) : null,
        sku: row.sku,
        barcode: row.barcode,
        brand: row.brand,
        images: row.images || [],
        weight: row.weight ? parseFloat(row.weight) : null,
        dimensions: row.dimensions,
        inventory: row.inventory,
        lowStock: row.lowStock,
        status: row.status,
        featured: row.featured,
        tags: row.tags || [],
        seoTitle: row.seoTitle,
        seoDescription: row.seoDescription,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        categoryId: row.categoryId,
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          color: row.category_color
        } : null
      }))
      
      return NextResponse.json({ products })
    }
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