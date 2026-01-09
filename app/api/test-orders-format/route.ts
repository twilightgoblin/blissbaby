import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET(request: NextRequest) {
  try {
    const userId = "user_37z0cEH8QmrW4LgMopQ78CD3qYd" // Your actual user ID
    
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false }
    })
    
    const client = await pool.connect()
    
    // Get orders with the same format as the real API
    const ordersResult = await client.query(`
      SELECT * FROM orders WHERE "clerkUserId" = $1 ORDER BY "createdAt" DESC
    `, [userId])
    
    const orders = []
    for (const order of ordersResult.rows) {
      // Get order items
      const itemsResult = await client.query(`
        SELECT oi.*, p.name as product_name, p.images as product_images
        FROM order_items oi
        LEFT JOIN products p ON oi."productId" = p.id
        WHERE oi."orderId" = $1
      `, [order.id])
      
      // Get payments
      const paymentsResult = await client.query(`
        SELECT * FROM payments WHERE "orderId" = $1
      `, [order.id])
      
      orders.push({
        ...order,
        items: itemsResult.rows.map(item => ({
          ...item,
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat(item.totalPrice),
          product: {
            id: item.productId,
            name: item.product_name,
            images: item.product_images || []
          }
        })),
        payments: paymentsResult.rows.map(payment => ({
          ...payment,
          amount: parseFloat(payment.amount)
        })),
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.taxAmount),
        shippingAmount: parseFloat(order.shippingAmount),
        totalAmount: parseFloat(order.totalAmount)
      })
    }
    
    client.release()
    await pool.end()
    
    // Return in the same format as the real API
    return NextResponse.json({ 
      orders,
      debug: {
        userId,
        ordersCount: orders.length,
        firstOrderId: orders[0]?.id,
        firstOrderNumber: orders[0]?.orderNumber
      }
    })
    
  } catch (error) {
    console.error('Test orders format error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Test failed'
    }, { status: 500 })
  }
}