import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/categories'

// GET /api/categories - Get all active categories (public endpoint)
export async function GET() {
  try {
    const allCategories = await getCategories()
    
    // Filter only active categories for public use
    const activeCategories = allCategories.filter(category => category.isActive)
    
    return NextResponse.json({ categories: activeCategories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    
    // If Prisma fails, try raw SQL as fallback
    try {
      const { Pool } = await import('pg')
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        ssl: { rejectUnauthorized: false }
      })
      
      const client = await pool.connect()
      const result = await client.query(`
        SELECT id, name, description, icon, image, color, "isActive", "sortOrder", "createdAt", "updatedAt"
        FROM categories 
        WHERE "isActive" = true 
        ORDER BY "sortOrder" ASC
      `)
      
      client.release()
      await pool.end()
      
      return NextResponse.json({ categories: result.rows })
      
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError)
      
      // Return detailed error in development, generic in production
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? `Failed to fetch categories: ${error instanceof Error ? error.message : 'Unknown error'}`
        : 'Failed to fetch categories'
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  }
}