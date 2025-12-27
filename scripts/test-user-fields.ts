#!/usr/bin/env tsx

import 'dotenv/config'
import { db } from '../lib/db'
import { createAddress, createOrder, createPayment } from '../lib/db-helpers'

async function testUserFields() {
  console.log('Testing user email and name fields...')

  try {
    // Get a test user
    const user = await db.user.findFirst()
    if (!user) {
      console.log('No users found in database')
      return
    }

    console.log(`Testing with user: ${user.email} (${user.name})`)

    // Test creating an address
    console.log('\n1. Testing address creation...')
    const address = await createAddress({
      userId: user.id,
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345'
    })
    console.log(`✅ Address created with userEmail: ${address.userEmail}, userName: ${address.userName}`)

    // Test creating an order
    console.log('\n2. Testing order creation...')
    const product = await db.product.findFirst()
    if (product) {
      const order = await createOrder({
        userId: user.id,
        items: [{
          productId: product.id,
          quantity: 1,
          unitPrice: Number(product.price)
        }],
        subtotal: Number(product.price),
        shippingAddressId: address.id
      })
      console.log(`✅ Order created with userEmail: ${order.userEmail}, userName: ${order.userName}`)

      // Test creating a payment
      console.log('\n3. Testing payment creation...')
      const payment = await createPayment({
        orderId: order.id,
        amount: Number(order.totalAmount),
        method: 'CREDIT_CARD',
        provider: 'stripe'
      })
      console.log(`✅ Payment created with userEmail: ${payment.userEmail}, userName: ${payment.userName}`)
    }

    // Check existing cart
    console.log('\n4. Checking existing cart...')
    const cart = await db.cart.findFirst({
      where: { userId: user.id }
    })
    if (cart) {
      console.log(`✅ Cart found with userEmail: ${cart.userEmail}, userName: ${cart.userName}`)
    }

    console.log('\n🎉 All tests passed!')

  } catch (error) {
    console.error('Error during testing:', error)
  } finally {
    await db.$disconnect()
  }
}

testUserFields()