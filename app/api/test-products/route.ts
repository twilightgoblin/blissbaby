import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  try {
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false }
    })
    
    const client = await pool.connect()
    
    // Get all products
    const result = await client.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      ORDER BY p."createdAt" DESC
    `)
    
    client.release()
    await pool.end()
    
    return NextResponse.json({
      success: true,
      count: result.rows.length,
      products: result.rows
    })
    
  } catch (error) {
    console.error('Error testing products:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}