import { NextRequest, NextResponse } from 'next/server'
import { getCategories, createCategory } from '@/lib/categories'

// GET /api/admin/categories - Get all categories
export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    
    // Fallback with raw SQL
    try {
      const { Pool } = await import('pg')
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        ssl: { rejectUnauthorized: false }
      })
      
      const client = await pool.connect()
      const result = await client.query(`
        SELECT id, name, description, icon, image, color, "isActive", "sortOrder", "createdAt", "updatedAt",
               (SELECT COUNT(*) FROM products WHERE "categoryId" = categories.id) as product_count
        FROM categories 
        ORDER BY "sortOrder" ASC
      `)
      
      client.release()
      await pool.end()
      
      const categories = result.rows.map(row => ({
        ...row,
        _count: { products: parseInt(row.product_count) }
      }))
      
      return NextResponse.json(categories)
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, icon, image, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const category = await createCategory({ name, description, icon, image, color })
    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}