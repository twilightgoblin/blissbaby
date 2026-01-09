import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false }
    })
    
    const client = await pool.connect()
    
    // Get all orders to see what user IDs exist
    const allOrdersResult = await client.query(`
      SELECT "clerkUserId", "userEmail", "userName", "orderNumber", "totalAmount", "createdAt"
      FROM orders 
      ORDER BY "createdAt" DESC 
      LIMIT 10
    `)
    
    // Get all carts to see what user IDs exist
    const allCartsResult = await client.query(`
      SELECT "clerkUserId", "userEmail", "userName", "createdAt"
      FROM carts 
      ORDER BY "createdAt" DESC 
      LIMIT 10
    `)
    
    // Get specific user data if userId provided
    let userOrders = []
    let userAddresses = []
    let userCarts = []
    
    if (userId) {
      const userOrdersResult = await client.query(`
        SELECT * FROM orders WHERE "clerkUserId" = $1
      `, [userId])
      userOrders = userOrdersResult.rows
      
      const userAddressesResult = await client.query(`
        SELECT * FROM addresses WHERE "clerkUserId" = $1
      `, [userId])
      userAddresses = userAddressesResult.rows
      
      const userCartsResult = await client.query(`
        SELECT * FROM carts WHERE "clerkUserId" = $1
      `, [userId])
      userCarts = userCartsResult.rows
    }
    
    client.release()
    await pool.end()
    
    return NextResponse.json({
      requestedUserId: userId,
      allOrders: allOrdersResult.rows,
      allCarts: allCartsResult.rows,
      userSpecificData: {
        orders: userOrders,
        addresses: userAddresses,
        carts: userCarts
      },
      summary: {
        totalOrdersInDb: allOrdersResult.rows.length,
        totalCartsInDb: allCartsResult.rows.length,
        userOrdersCount: userOrders.length,
        userAddressesCount: userAddresses.length,
        userCartsCount: userCarts.length
      }
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Debug failed'
    }, { status: 500 })
  }
}