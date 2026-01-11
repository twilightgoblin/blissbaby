import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check client-side environment variables
    const clientEnvVars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NEXT_PUBLIC_FIREBASE_VAPID_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    }

    // Check server-side environment variables
    const serverEnvVars = {
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    }

    // Test Firebase Admin initialization
    let adminStatus = 'Not tested'
    try {
      const { getFirebaseMessaging } = await import('@/lib/firebase-admin')
      const messaging = getFirebaseMessaging()
      adminStatus = messaging ? 'Initialized' : 'Failed to initialize'
    } catch (error) {
      adminStatus = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    const allClientVarsPresent = Object.values(clientEnvVars).every(Boolean)
    const allServerVarsPresent = Object.values(serverEnvVars).every(Boolean)

    return NextResponse.json({
      success: true,
      status: {
        clientEnvVars,
        serverEnvVars,
        adminStatus,
        allClientVarsPresent,
        allServerVarsPresent,
        overallStatus: allClientVarsPresent && allServerVarsPresent ? 'Ready' : 'Incomplete'
      },
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Firebase test error:', error)
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