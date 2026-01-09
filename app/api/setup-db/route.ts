import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST() {
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
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('categories', 'products', 'carts', 'cart_items')
    `)
    
    const existingTables = tablesResult.rows.map(row => row.table_name)
    
    if (existingTables.length === 0) {
      // Tables don't exist, we need to run migrations
      client.release()
      await pool.end()
      
      return NextResponse.json({
        success: false,
        error: 'Database tables do not exist. Migrations need to be applied.',
        existingTables,
        suggestion: 'Run: npx prisma migrate deploy'
      }, { status: 500 })
    }
    
    client.release()
    await pool.end()
    
    return NextResponse.json({
      success: true,
      message: 'Database is properly set up',
      existingTables
    })
    
  } catch (error) {
    console.error('Database setup check error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Setup check failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to check database setup'
  })
}