#!/usr/bin/env tsx

import 'dotenv/config'
import { db } from '../lib/db'

async function testAdminOrders() {
  try {
    console.log('🔍 Testing Admin Orders API...')
    console.log('🔗 Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Missing')
    
    // Check if there are any orders in the database
    const orderCount = await db.order.count()
    console.log(`📊 Total orders in database: ${orderCount}`)
    
    if (orderCount === 0) {
      console.log('ℹ️  No orders found. This is expected for a new installation.')
      console.log('💡 Orders will appear once customers start placing them through the checkout process.')
    } else {
      // Fetch some sample orders
      const orders = await db.order.findMany({
        take: 5,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true
                }
              }
            }
          },
          payments: true,
          shippingAddress: true,
          billingAddress: true
        },
        orderBy: { createdAt: 'desc' }
      })
      
      console.log(`📦 Sample orders:`)
      orders.forEach(order => {
        console.log(`  - ${order.orderNumber}: ${order.status} - $${order.totalAmount} (${order.items.length} items)`)
      })
    }
    
    // Test the API endpoint
    console.log('\n🌐 Testing API endpoint...')
    const response = await fetch('http://localhost:3000/api/admin/orders?page=1&limit=5')
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API endpoint working correctly')
      console.log(`📊 API returned ${data.orders.length} orders, ${data.pagination.total} total`)
    } else {
      console.log('❌ API endpoint failed:', response.status, response.statusText)
    }
    
  } catch (error) {
    console.error('❌ Error testing admin orders:', error)
  } finally {
    await db.$disconnect()
  }
}

testAdminOrders()