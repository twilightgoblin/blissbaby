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
    
    // Get a sample cart with items
    const cartResult = await client.query(`
      SELECT c.*, 
             json_agg(
               json_build_object(
                 'id', ci.id,
                 'productId', ci."productId",
                 'quantity', ci.quantity,
                 'productName', ci."productName",
                 'product', json_build_object(
                   'id', p.id,
                   'name', p.name,
                   'price', p.price,
                   'images', p.images,
                   'category', json_build_object(
                     'id', cat.id,
                     'name', cat.name,
                     'color', cat.color
                   )
                 )
               )
             ) as items
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci."cartId"
      LEFT JOIN products p ON ci."productId" = p.id
      LEFT JOIN categories cat ON p."categoryId" = cat.id
      WHERE c.id IS NOT NULL
      GROUP BY c.id
      LIMIT 1
    `)
    
    client.release()
    await pool.end()
    
    return NextResponse.json({
      success: true,
      sampleCart: cartResult.rows[0] || null,
      message: 'This shows the structure of cart data returned by the API'
    })
    
  } catch (error) {
    console.error('Error testing cart structure:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}