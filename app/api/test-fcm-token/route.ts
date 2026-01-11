import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return the current VAPID key for testing
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    
    return NextResponse.json({
      success: true,
      vapidKey: vapidKey ? `${vapidKey.substring(0, 20)}...` : 'Not set',
      vapidKeyLength: vapidKey?.length || 0,
      isCorrectLength: vapidKey?.length === 88, // VAPID keys should be 88 characters
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('VAPID key test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}