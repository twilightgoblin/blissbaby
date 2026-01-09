import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    try {
      const orders = await db.order.findMany({
        where: { clerkUserId: userId },
        include: {
          items: {
            include: {
              product: true
            }
          },
          payments: true,
          shippingAddress: true,
          billingAddress: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ orders })
    } catch (prismaError) {
      console.log('Prisma failed, using raw SQL fallback for orders:', prismaError)
      
      // Fallback with raw SQL
      const { Pool } = await import('pg')
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        ssl: { rejectUnauthorized: false }
      })
      
      const client = await pool.connect()
      
      // Get orders with basic info
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
      
      return NextResponse.json({ orders })
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Try to get user ID from Clerk, but don't fail if not available
    let userId = null
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (authError) {
      // Auth failed, continue as guest user
      console.log('Auth not available, continuing as guest user')
    }
    
    const body = await request.json()
    
    const {
      clerkUserId,
      userEmail,
      userName,
      cartItems,
      shippingAddress,
      billingAddress,
      paymentIntentId,
      subtotal,
      taxAmount,
      shippingAmount,
      totalAmount,
      currency = 'INR'
    } = body

    // Validate required fields
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      )
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    // Use the provided clerkUserId or fallback to the auth userId or 'guest'
    const finalUserId = clerkUserId || userId || 'guest'

    // Generate unique order number
    const orderNumber = `BB-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    try {
      // Try Prisma first
      const order = await db.$transaction(async (tx) => {
        // Create shipping address if provided
        let shippingAddressId = null
        if (shippingAddress) {
          const createdShippingAddress = await tx.address.create({
            data: {
              clerkUserId: finalUserId,
              userEmail,
              userName,
              type: 'SHIPPING',
              firstName: shippingAddress.firstName,
              lastName: shippingAddress.lastName,
              company: shippingAddress.company || '',
              addressLine1: shippingAddress.addressLine1,
              addressLine2: shippingAddress.addressLine2 || '',
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country || 'IN',
              phone: shippingAddress.phone || '',
            }
          })
          shippingAddressId = createdShippingAddress.id
        }

        // Create billing address if provided and different from shipping
        let billingAddressId = shippingAddressId
        if (billingAddress && billingAddress !== shippingAddress) {
          const createdBillingAddress = await tx.address.create({
            data: {
              clerkUserId: finalUserId,
              userEmail,
              userName,
              type: 'BILLING',
              firstName: billingAddress.firstName,
              lastName: billingAddress.lastName,
              company: billingAddress.company || '',
              addressLine1: billingAddress.addressLine1,
              addressLine2: billingAddress.addressLine2 || '',
              city: billingAddress.city,
              state: billingAddress.state,
              postalCode: billingAddress.postalCode,
              country: billingAddress.country || 'IN',
              phone: billingAddress.phone || '',
            }
          })
          billingAddressId = createdBillingAddress.id
        }

        // Create the order
        const newOrder = await tx.order.create({
          data: {
            clerkUserId: finalUserId,
            userEmail,
            userName,
            orderNumber,
            status: 'PENDING',
            subtotal: parseFloat(subtotal.toString()),
            taxAmount: parseFloat(taxAmount.toString()),
            shippingAmount: parseFloat(shippingAmount.toString()),
            totalAmount: parseFloat(totalAmount.toString()),
            currency,
            shippingAddressId,
            billingAddressId,
          }
        })

        // Create order items
        const orderItems = await Promise.all(
          cartItems.map((item: any) =>
            tx.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unitPrice.toString()),
                totalPrice: parseFloat((item.unitPrice * item.quantity).toString()),
              }
            })
          )
        )

        // Create payment record
        const payment = await tx.payment.create({
          data: {
            orderId: newOrder.id,
            userEmail,
            userName,
            amount: parseFloat(totalAmount.toString()),
            currency,
            status: 'COMPLETED',
            method: 'CREDIT_CARD',
            provider: 'stripe',
            providerPaymentId: paymentIntentId,
            processedAt: new Date(),
          }
        })

        // Clear the user's cart after successful order
        if (finalUserId !== 'guest') {
          await tx.cartItem.deleteMany({
            where: {
              cart: {
                clerkUserId: finalUserId
              }
            }
          })
        }

        return {
          ...newOrder,
          items: orderItems,
          payment,
          shippingAddress: shippingAddressId ? await tx.address.findUnique({ where: { id: shippingAddressId } }) : null,
          billingAddress: billingAddressId ? await tx.address.findUnique({ where: { id: billingAddressId } }) : null,
        }
      })

      return NextResponse.json({ 
        success: true, 
        order,
        message: 'Order created successfully' 
      })

    } catch (prismaError) {
      console.log('Prisma failed, using raw SQL fallback for order creation:', prismaError)
      
      // Fallback with raw SQL
      const { Pool } = await import('pg')
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        ssl: { rejectUnauthorized: false }
      })
      
      const client = await pool.connect()
      
      try {
        await client.query('BEGIN')
        
        // Create order
        const orderId = crypto.randomUUID()
        const orderResult = await client.query(`
          INSERT INTO orders (
            id, "clerkUserId", "userEmail", "userName", "orderNumber", status, 
            subtotal, "taxAmount", "shippingAmount", "totalAmount", currency, "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
          ) RETURNING *
        `, [
          orderId, finalUserId, userEmail, userName, orderNumber, 'PENDING',
          parseFloat(subtotal.toString()), parseFloat(taxAmount.toString()), 
          parseFloat(shippingAmount.toString()), parseFloat(totalAmount.toString()), currency
        ])
        
        const order = orderResult.rows[0]
        
        // Create order items
        const orderItems = []
        for (const item of cartItems) {
          const itemId = crypto.randomUUID()
          const itemResult = await client.query(`
            INSERT INTO order_items (
              id, "orderId", "productId", quantity, "unitPrice", "totalPrice", "createdAt", "updatedAt"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, NOW(), NOW()
            ) RETURNING *
          `, [
            itemId, orderId, item.productId, item.quantity, 
            parseFloat(item.unitPrice.toString()), parseFloat((item.unitPrice * item.quantity).toString())
          ])
          orderItems.push(itemResult.rows[0])
        }
        
        // Create payment record
        const paymentId = crypto.randomUUID()
        const paymentResult = await client.query(`
          INSERT INTO payments (
            id, "orderId", "userEmail", "userName", amount, currency, status, method, 
            provider, "providerPaymentId", "processedAt", "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW()
          ) RETURNING *
        `, [
          paymentId, orderId, userEmail, userName, parseFloat(totalAmount.toString()), 
          currency, 'COMPLETED', 'CREDIT_CARD', 'stripe', paymentIntentId
        ])
        
        // Clear the user's cart after successful order (raw SQL fallback)
        if (finalUserId !== 'guest') {
          await client.query(`
            DELETE FROM cart_items 
            WHERE "cartId" IN (
              SELECT id FROM carts WHERE "clerkUserId" = $1
            )
          `, [finalUserId])
        }
        
        await client.query('COMMIT')
        
        client.release()
        await pool.end()
        
        return NextResponse.json({ 
          success: true, 
          order: {
            ...order,
            items: orderItems,
            payment: paymentResult.rows[0]
          },
          message: 'Order created successfully (fallback)' 
        })
        
      } catch (fallbackError) {
        await client.query('ROLLBACK')
        client.release()
        await pool.end()
        throw fallbackError
      }
    }

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}