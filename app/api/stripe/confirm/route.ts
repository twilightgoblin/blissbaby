import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        paymentIntent,
        message: 'Payment confirmed successfully'
      })
    }

    if (paymentIntent.status === 'requires_confirmation') {
      // Confirm the payment intent
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
      
      return NextResponse.json({
        success: true,
        paymentIntent: confirmedPaymentIntent,
        message: 'Payment confirmed successfully'
      })
    }

    if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        success: false,
        paymentIntent,
        requiresAction: true,
        message: 'Payment requires additional action'
      })
    }

    return NextResponse.json({
      success: false,
      paymentIntent,
      message: `Payment status: ${paymentIntent.status}`
    })

  } catch (error: any) {
    console.error('Error confirming payment:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to confirm payment',
      code: error.code,
      type: error.type
    }, { status: 400 })
  }
}