import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ProductStatus } from '@prisma/client'

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
      where.categories = { name: category }
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    try {
      const [products, total] = await Promise.all([
        db.products.findMany({
          where,
          include: {
            categories: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        db.products.count({ where })
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
    } catch (prismaError) {
      console.log('Prisma failed, using raw SQL fallback:', prismaError)
      
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
        SELECT p.*, c.name as category_name, c.color as category_color
        FROM products p
        LEFT JOIN categories c ON p."categoryId" = c.id
        WHERE 1=1
      `
      const queryParams: any[] = []
      let paramIndex = 1
      
      if (search) {
        sqlQuery += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`
        queryParams.push(`%${search}%`)
        paramIndex++
      }
      
      if (category && category !== 'all') {
        sqlQuery += ` AND c.name = $${paramIndex}`
        queryParams.push(category)
        paramIndex++
      }
      
      if (status && status !== 'all') {
        sqlQuery += ` AND p.status = $${paramIndex}`
        queryParams.push(status.toUpperCase())
        paramIndex++
      }
      
      sqlQuery += ` ORDER BY p."createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      queryParams.push(limit, skip)
      
      const result = await client.query(sqlQuery, queryParams)
      
      // Get total count
      let countQuery = `
        SELECT COUNT(*) 
        FROM products p
        LEFT JOIN categories c ON p."categoryId" = c.id
        WHERE 1=1
      `
      const countParams: any[] = []
      let countParamIndex = 1
      
      if (search) {
        countQuery += ` AND (p.name ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex} OR p.sku ILIKE $${countParamIndex})`
        countParams.push(`%${search}%`)
        countParamIndex++
      }
      
      if (category && category !== 'all') {
        countQuery += ` AND c.name = $${countParamIndex}`
        countParams.push(category)
        countParamIndex++
      }
      
      if (status && status !== 'all') {
        countQuery += ` AND p.status = $${countParamIndex}`
        countParams.push(status.toUpperCase())
        countParamIndex++
      }
      
      const countResult = await client.query(countQuery, countParams)
      const total = parseInt(countResult.rows[0].count)
      
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
          id: row.categoryId,
          name: row.category_name,
          color: row.category_color
        } : null
      }))
      
      return NextResponse.json({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    }
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

    try {
      // Check if SKU already exists
      if (sku) {
        const existingSku = await db.products.findUnique({
          where: { sku }
        })
        if (existingSku) {
          return NextResponse.json(
            { error: 'SKU already exists' },
            { status: 400 }
          )
        }
      }

      const product = await db.products.create({
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
          status: status || ProductStatus.ACTIVE,
          seoTitle,
          seoDescription
        },
        include: {
          category: true
        }
      })

      return NextResponse.json({ product }, { status: 201 })
    } catch (prismaError) {
      console.log('Prisma failed, using raw SQL fallback for product creation:', prismaError)
      
      // Fallback with raw SQL
      const { Pool } = await import('pg')
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        ssl: { rejectUnauthorized: false }
      })
      
      const client = await pool.connect()
      
      // Check if SKU already exists with raw SQL
      if (sku) {
        const existingSkuResult = await client.query('SELECT id FROM products WHERE sku = $1', [sku])
        if (existingSkuResult.rows.length > 0) {
          client.release()
          await pool.end()
          return NextResponse.json(
            { error: 'SKU already exists' },
            { status: 400 }
          )
        }
      }
      
      // Create product with raw SQL
      const productId = crypto.randomUUID()
      
      const insertQuery = `
        INSERT INTO products (
          id, name, description, price, "comparePrice", "categoryId", brand, 
          images, inventory, "lowStock", sku, barcode, weight, dimensions, 
          tags, featured, status, "seoTitle", "seoDescription", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
        ) RETURNING *
      `
      
      const values = [
        productId,
        name,
        description,
        parseFloat(price),
        comparePrice ? parseFloat(comparePrice) : null,
        categoryId,
        brand,
        images || [],
        parseInt(inventory) || 0,
        parseInt(lowStock) || 5,
        sku,
        barcode,
        weight ? parseFloat(weight) : null,
        dimensions,
        tags || [],
        featured || false,
        status || ProductStatus.ACTIVE,
        seoTitle,
        seoDescription
      ]
      
      const result = await client.query(insertQuery, values)
      
      // Get category info
      const categoryResult = await client.query('SELECT * FROM categories WHERE id = $1', [categoryId])
      
      client.release()
      await pool.end()
      
      const product = {
        ...result.rows[0],
        price: parseFloat(result.rows[0].price),
        comparePrice: result.rows[0].comparePrice ? parseFloat(result.rows[0].comparePrice) : null,
        weight: result.rows[0].weight ? parseFloat(result.rows[0].weight) : null,
        category: categoryResult.rows[0] || null
      }
      
      return NextResponse.json({ product }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}