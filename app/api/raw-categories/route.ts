import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  try {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found'
      }, { status: 500 })
    }
    
    const pool = new Pool({
      connectionString,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    })
    
    const client = await pool.connect()
    
    // Get categories using raw SQL
    const result = await client.query(`
      SELECT id, name, description, icon, image, color, "isActive", "sortOrder", "createdAt", "updatedAt"
      FROM categories 
      WHERE "isActive" = true 
      ORDER BY "sortOrder" ASC
    `)
    
    client.release()
    await pool.end()
    
    return NextResponse.json({
      success: true,
      categories: result.rows
    })
    
  } catch (error) {
    console.error('Raw categories error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}