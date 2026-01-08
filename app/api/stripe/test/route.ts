import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    // Check if environment variables are set
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const secretKey = process.env.STRIPE_SECRET_KEY
    
    if (!publishableKey) {
      return NextResponse.json({
        error: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set',
        status: 'error'
      })
    }
    
    if (!secretKey) {
      return NextResponse.json({
        error: 'STRIPE_SECRET_KEY is not set',
        status: 'error'
      })
    }
    
    // Test Stripe connection
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    })
    
    // Try to retrieve account info (this will fail if keys are invalid)
    const account = await stripe.accounts.retrieve()
    
    return NextResponse.json({
      status: 'success',
      message: 'Stripe configuration is valid',
      publishableKeyPrefix: publishableKey.substring(0, 12) + '...',
      accountId: account.id,
      testMode: publishableKey.startsWith('pk_test_')
    })
  } catch (error) {
    console.error('Stripe test error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        error: `Stripe error: ${error.message}`,
        status: 'error',
        type: error.type
      })
    }
    
    return NextResponse.json({
      error: 'Failed to test Stripe configuration',
      status: 'error'
    })
  }
}