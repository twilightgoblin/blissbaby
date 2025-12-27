import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        console.log('Payment succeeded:', paymentIntent.id)
        
        // Create order in database
        if (paymentIntent.metadata.userId && paymentIntent.metadata.cartId) {
          try {
            // Get cart items
            const cart = await db.cart.findUnique({
              where: { id: paymentIntent.metadata.cartId },
              include: {
                items: {
                  include: {
                    product: true
                  }
                },
                user: true
              }
            })

            if (cart) {
              const subtotal = cart.items.reduce((sum, item) => 
                sum + (Number(item.product.price) * item.quantity), 0
              )
              const taxAmount = subtotal * 0.08 // 8% tax
              const totalAmount = subtotal + taxAmount

              // Generate order number
              const orderNumber = `BB-${Date.now()}-${Math.floor(Math.random() * 1000)}`

              // Create order
              const order = await db.order.create({
                data: {
                  userId: paymentIntent.metadata.userId,
                  userEmail: cart.user.email,
                  userName: cart.user.name,
                  orderNumber,
                  status: 'CONFIRMED',
                  subtotal,
                  taxAmount,
                  totalAmount,
                  items: {
                    create: cart.items.map(item => ({
                      productId: item.productId,
                      quantity: item.quantity,
                      unitPrice: item.product.price,
                      totalPrice: Number(item.product.price) * item.quantity
                    }))
                  }
                }
              })

              // Create payment record
              await db.payment.create({
                data: {
                  orderId: order.id,
                  userEmail: cart.user.email,
                  userName: cart.user.name,
                  amount: totalAmount,
                  status: 'COMPLETED',
                  method: 'CREDIT_CARD',
                  provider: 'stripe',
                  providerPaymentId: paymentIntent.id,
                  processedAt: new Date()
                }
              })

              // Clear the cart
              await db.cartItem.deleteMany({
                where: { cartId: cart.id }
              })

              console.log('Order created successfully:', order.orderNumber)
            }
          } catch (dbError) {
            console.error('Error creating order:', dbError)
          }
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        console.log('Payment failed:', failedPayment.id)
        
        // Create failed payment record if we have the metadata
        if (failedPayment.metadata.userId) {
          try {
            const user = await db.user.findUnique({
              where: { id: failedPayment.metadata.userId }
            })

            if (user) {
              await db.payment.create({
                data: {
                  orderId: failedPayment.metadata.orderId || 'temp-' + failedPayment.id,
                  userEmail: user.email,
                  userName: user.name,
                  amount: failedPayment.amount / 100,
                  status: 'FAILED',
                  method: 'CREDIT_CARD',
                  provider: 'stripe',
                  providerPaymentId: failedPayment.id,
                  failureReason: failedPayment.last_payment_error?.message
                }
              })
            }
          } catch (dbError) {
            console.error('Error recording failed payment:', dbError)
          }
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}