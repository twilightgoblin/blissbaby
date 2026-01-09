import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Test all user endpoints
    const results = {
      userId,
      timestamp: new Date().toISOString(),
      endpoints: {}
    }
    
    // Test addresses
    try {
      const addressResponse = await fetch(`${request.nextUrl.origin}/api/addresses?userId=${userId}`)
      results.endpoints.addresses = {
        status: addressResponse.status,
        ok: addressResponse.ok
      }
    } catch (e) {
      results.endpoints.addresses = { error: e.message }
    }
    
    // Test orders
    try {
      const ordersResponse = await fetch(`${request.nextUrl.origin}/api/orders?userId=${userId}`)
      results.endpoints.orders = {
        status: ordersResponse.status,
        ok: ordersResponse.ok
      }
    } catch (e) {
      results.endpoints.orders = { error: e.message }
    }
    
    // Test other endpoints
    const staticEndpoints = ['contact', 'shipping', 'returns', 'faq', 'privacy']
    for (const endpoint of staticEndpoints) {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/${endpoint}`)
        results.endpoints[endpoint] = {
          status: response.status,
          ok: response.ok
        }
      } catch (e) {
        results.endpoints[endpoint] = { error: e.message }
      }
    }
    
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}