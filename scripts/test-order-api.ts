import 'dotenv/config'
import { db } from '../lib/db'

async function testOrderAPI() {
  try {
    console.log('Testing Order API...')
    
    // First, get a real product from the database
    console.log('Fetching a real product...')
    const product = await db.product.findFirst()
    
    if (!product) {
      console.error('❌ No products found in database. Please seed the database first.')
      return
    }
    
    console.log(`✅ Found product: ${product.name} (ID: ${product.id})`)
    
    // Simulate order creation data
    const orderData = {
      clerkUserId: 'user_test123',
      userEmail: 'test@example.com',
      userName: 'Test User',
      cartItems: [
        {
          productId: product.id, // Use real product ID
          quantity: 2,
          unitPrice: parseFloat(product.price.toString())
        }
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        company: '',
        addressLine1: '123 Test Street',
        addressLine2: '',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'IN',
        phone: '+91 9876543210'
      },
      billingAddress: null, // Same as shipping
      paymentIntentId: 'pi_test_123456789',
      subtotal: parseFloat(product.price.toString()) * 2,
      taxAmount: parseFloat(product.price.toString()) * 2 * 0.08,
      shippingAmount: 0.00,
      totalAmount: parseFloat(product.price.toString()) * 2 * 1.08,
      currency: 'INR'
    }
    
    console.log('Sending order creation request...')
    
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Order created successfully!')
      console.log('Order ID:', result.order.id)
      console.log('Order Number:', result.order.orderNumber)
      console.log('Total Amount:', result.order.totalAmount)
      
      // Clean up the test order
      console.log('Cleaning up test order...')
      await db.payment.deleteMany({ where: { orderId: result.order.id } })
      await db.orderItem.deleteMany({ where: { orderId: result.order.id } })
      await db.order.delete({ where: { id: result.order.id } })
      if (result.order.shippingAddress) {
        await db.address.delete({ where: { id: result.order.shippingAddressId } })
      }
      console.log('✅ Test order cleaned up')
    } else {
      console.error('❌ Order creation failed:', result)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testOrderAPI()