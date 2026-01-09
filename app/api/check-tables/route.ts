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
    
    // Check what tables exist
    const tablesResult = await client.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('categories', 'products', 'carts', 'cart_items')
      ORDER BY table_name, ordinal_position
    `)
    
    // Get counts from each table
    const counts = {}
    try {
      const categoryCount = await client.query('SELECT COUNT(*) FROM categories')
      counts.categories = parseInt(categoryCount.rows[0].count)
    } catch (e) {
      counts.categories = 'error: ' + e.message
    }
    
    try {
      const productCount = await client.query('SELECT COUNT(*) FROM products')
      counts.products = parseInt(productCount.rows[0].count)
    } catch (e) {
      counts.products = 'error: ' + e.message
    }
    
    try {
      const cartCount = await client.query('SELECT COUNT(*) FROM carts')
      counts.carts = parseInt(cartCount.rows[0].count)
    } catch (e) {
      counts.carts = 'error: ' + e.message
    }
    
    try {
      const cartItemCount = await client.query('SELECT COUNT(*) FROM cart_items')
      counts.cart_items = parseInt(cartItemCount.rows[0].count)
    } catch (e) {
      counts.cart_items = 'error: ' + e.message
    }
    
    client.release()
    await pool.end()
    
    return NextResponse.json({
      success: true,
      tables: tablesResult.rows,
      counts
    })
    
  } catch (error) {
    console.error('Table check error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Table check failed'
    }, { status: 500 })
  }
}