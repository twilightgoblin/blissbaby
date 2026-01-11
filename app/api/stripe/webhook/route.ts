import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        
        try {
          // Update payment status in database
          await db.payments.updateMany({
            where: {
              providerPaymentId: paymentIntent.id
            },
            data: {
              status: 'COMPLETED',
              processedAt: new Date()
            }
          })

          // Update order status to CONFIRMED
          const payment = await db.payments.findFirst({
            where: {
              providerPaymentId: paymentIntent.id
            },
            include: {
              orders: true
            }
          })

          if (payment) {
            await db.orders.update({
              where: {
                id: payment.orderId
              },
              data: {
                status: 'CONFIRMED'
              }
            })
            console.log(`Order ${payment.orders.orderNumber} confirmed after successful payment`)
          }
        } catch (dbError) {
          console.error('Database update error:', dbError)
        }
        
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', failedPayment.id)
        
        try {
          // Update payment status to FAILED
          await db.payments.updateMany({
            where: {
              providerPaymentId: failedPayment.id
            },
            data: {
              status: 'FAILED',
              failureReason: failedPayment.last_payment_error?.message || 'Payment failed'
            }
          })

          // Update order status to CANCELLED
          const payment = await db.payments.findFirst({
            where: {
              providerPaymentId: failedPayment.id
            },
            include: {
              orders: true
            }
          })

          if (payment) {
            await db.orders.update({
              where: {
                id: payment.orderId
              },
              data: {
                status: 'CANCELLED'
              }
            })
            console.log(`Order ${payment.orders.orderNumber} cancelled due to payment failure`)
          }
        } catch (dbError) {
          console.error('Database update error for failed payment:', dbError)
        }
        
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}