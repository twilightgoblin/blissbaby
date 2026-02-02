import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getActiveProducts, createProduct } from '@/lib/db-helpers'
import { ProductStatus } from '@prisma/client'
import { CachedQueries, CacheInvalidator } from '@/lib/cache-wrapper'
import { CacheKeys, CacheTTL } from '@/lib/redis'
import { withCache } from '@/lib/cache-wrapper'

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
    const page = parseInt(searchParams.get('page') || '1')
    const limitNum = limit ? parseInt(limit) : 20

    // Create cache key based on all parameters
    const cacheKey = `products:${page}:${limitNum}:${category || 'all'}:${featured || 'all'}:${minPrice || 'min'}:${maxPrice || 'max'}:${sortBy}:${sortOrder}:${search || 'none'}`

    // Use cache wrapper for the entire query
    const result = await withCache(
      cacheKey,
      async () => {
        const where: any = { status: ProductStatus.ACTIVE }
        
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
          const skip = (page - 1) * limitNum
          
          const [products, total] = await Promise.all([
            db.products.findMany({
              where,
              include: {
                categories: {
                  select: {
                    id: true,
                    name: true,
                    color: true
                  }
                }
              },
              skip,
              take: limitNum,
              orderBy
            }),
            db.products.count({ where })
          ])

          return { 
            products: products.map(p => ({
              ...p,
              category: p.categories // Map categories to category for frontend compatibility
            })),
            total,
            page,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
          }
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
          
          // Add pagination
          const skip = (page - 1) * limitNum
          sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
          queryParams.push(limitNum, skip)
          
          const result = await client.query(sqlQuery, queryParams)
          
          // Get total count
          let countQuery = `
            SELECT COUNT(*) as total
            FROM products p
            WHERE p.status = 'ACTIVE'
          `
          const countParams: any[] = []
          let countParamIndex = 1
          
          if (category) {
            countQuery += ` AND p."categoryId" = $${countParamIndex}`
            countParams.push(category)
            countParamIndex++
          }
          
          if (featured === 'true') {
            countQuery += ` AND p.featured = true`
          }
          
          if (minPrice) {
            countQuery += ` AND p.price >= $${countParamIndex}`
            countParams.push(parseFloat(minPrice))
            countParamIndex++
          }
          
          if (maxPrice) {
            countQuery += ` AND p.price <= $${countParamIndex}`
            countParams.push(parseFloat(maxPrice))
            countParamIndex++
          }
          
          if (search) {
            countQuery += ` AND (p.name ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex} OR p.brand ILIKE $${countParamIndex})`
            countParams.push(`%${search}%`)
          }
          
          const countResult = await client.query(countQuery, countParams)
          const total = parseInt(countResult.rows[0].total)
          
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
          
          return { 
            products,
            total,
            page,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      },
      CacheTTL.MEDIUM // Cache for 30 minutes
    )

    return NextResponse.json(result)
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

    // Invalidate product caches after creating new product
    await CacheInvalidator.invalidateProduct(product.id)

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}