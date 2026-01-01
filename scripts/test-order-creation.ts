import 'dotenv/config'
import { db } from '../lib/db'

async function testOrderCreation() {
  try {
    console.log('Testing order creation flow...')
    
    // Test 1: Check if we can connect to the database
    console.log('1. Testing database connection...')
    const productCount = await db.product.count()
    console.log(`✅ Database connected. Found ${productCount} products.`)
    
    // Test 2: Check if we can create an address
    console.log('2. Testing address creation...')
    const testAddress = await db.address.create({
      data: {
        clerkUserId: 'test-user-123',
        userEmail: 'test@example.com',
        userName: 'Test User',
        type: 'SHIPPING',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'IN',
        phone: '+91 9876543210',
      }
    })
    console.log(`✅ Address created with ID: ${testAddress.id}`)
    
    // Test 3: Check if we can create an order
    console.log('3. Testing order creation...')
    const testOrder = await db.order.create({
      data: {
        clerkUserId: 'test-user-123',
        userEmail: 'test@example.com',
        userName: 'Test User',
        orderNumber: `TEST-${Date.now()}`,
        status: 'PENDING',
        subtotal: 100.00,
        taxAmount: 8.00,
        shippingAmount: 0.00,
        totalAmount: 108.00,
        currency: 'INR',
        shippingAddressId: testAddress.id,
        billingAddressId: testAddress.id,
      }
    })
    console.log(`✅ Order created with ID: ${testOrder.id}`)
    
    // Test 4: Check if we can create a payment record
    console.log('4. Testing payment creation...')
    const testPayment = await db.payment.create({
      data: {
        orderId: testOrder.id,
        userEmail: 'test@example.com',
        userName: 'Test User',
        amount: 108.00,
        currency: 'INR',
        status: 'COMPLETED',
        method: 'CREDIT_CARD',
        provider: 'stripe',
        providerPaymentId: 'pi_test_123456789',
        processedAt: new Date(),
      }
    })
    console.log(`✅ Payment created with ID: ${testPayment.id}`)
    
    // Test 5: Clean up test data
    console.log('5. Cleaning up test data...')
    await db.payment.delete({ where: { id: testPayment.id } })
    await db.order.delete({ where: { id: testOrder.id } })
    await db.address.delete({ where: { id: testAddress.id } })
    console.log('✅ Test data cleaned up')
    
    console.log('\n🎉 All tests passed! Order creation flow is working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

testOrderCreation()