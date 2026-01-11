"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getFCMToken } from '@/lib/firebase'
import { useUser } from '@clerk/nextjs'

export default function TestFirebasePage() {
  const { user, isSignedIn } = useUser()
  const [status, setStatus] = useState<string>('Checking Firebase configuration...')
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkFirebaseConfig()
  }, [])

  const checkFirebaseConfig = () => {
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
      'NEXT_PUBLIC_FIREBASE_VAPID_KEY'
    ]

    const envStatus = requiredEnvVars.map(envVar => ({
      name: envVar,
      value: process.env[envVar],
      present: !!process.env[envVar]
    }))

    const missing = envStatus.filter(env => !env.present)
    
    if (missing.length > 0) {
      setStatus('❌ Missing environment variables')
      setError(`Missing: ${missing.map(m => m.name).join(', ')}`)
    } else {
      setStatus('✅ All environment variables present')
      setError(null)
    }

    console.log('Firebase Environment Variables:', envStatus)
  }

  const testFCMToken = async () => {
    try {
      setStatus('🔄 Testing FCM token generation...')
      setError(null)

      if (!isSignedIn) {
        setError('Please sign in first')
        setStatus('❌ Not signed in')
        return
      }

      // Request notification permission first
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission()
        
        if (permission !== 'granted') {
          setError('Notification permission denied')
          setStatus('❌ Permission denied')
          return
        }
      }

      const fcmToken = await getFCMToken()
      
      if (fcmToken) {
        setToken(fcmToken)
        setStatus('✅ FCM token generated successfully!')
        
        // Try to save token to backend
        const response = await fetch('/api/notifications/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: fcmToken,
            email: user?.emailAddresses[0]?.emailAddress,
            firstName: user?.firstName,
            lastName: user?.lastName,
          }),
        })

        if (response.ok) {
          setStatus('✅ FCM token saved to database!')
        } else {
          const errorData = await response.json()
          setError(`Failed to save token: ${errorData.error}`)
        }
      } else {
        setError('Failed to generate FCM token')
        setStatus('❌ Token generation failed')
      }
    } catch (error) {
      console.error('FCM test error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setStatus('❌ FCM test failed')
    }
  }

  const sendTestNotification = async () => {
    try {
      setStatus('🔄 Sending test notification...')
      
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('✅ Test notification sent!')
      } else {
        setError(data.error || 'Failed to send test notification')
        setStatus('❌ Test notification failed')
      }
    } catch (error) {
      console.error('Test notification error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setStatus('❌ Test notification failed')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Firebase FCM Test</CardTitle>
            <CardDescription>
              Test Firebase Cloud Messaging configuration and functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">Status:</p>
              <p className="text-sm">{status}</p>
              {error && (
                <p className="text-sm text-red-600 mt-2">Error: {error}</p>
              )}
            </div>

            <div className="space-y-2">
              <Button onClick={checkFirebaseConfig} variant="outline" className="w-full">
                🔍 Check Environment Variables
              </Button>
              
              <Button 
                onClick={testFCMToken} 
                disabled={!isSignedIn}
                className="w-full"
              >
                🔑 Test FCM Token Generation
              </Button>
              
              <Button 
                onClick={sendTestNotification}
                disabled={!token || !isSignedIn}
                variant="secondary"
                className="w-full"
              >
                📱 Send Test Notification
              </Button>
            </div>

            {token && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">FCM Token Generated:</p>
                <p className="text-xs font-mono text-green-600 break-all mt-1">
                  {token.substring(0, 50)}...
                </p>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Make sure you're signed in with Clerk</p>
              <p>• Grant notification permissions when prompted</p>
              <p>• Check browser console for detailed logs</p>
              <p>• Test notifications will appear as browser notifications</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {[
                'NEXT_PUBLIC_FIREBASE_API_KEY',
                'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
                'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
                'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
                'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
                'NEXT_PUBLIC_FIREBASE_APP_ID',
                'NEXT_PUBLIC_FIREBASE_VAPID_KEY'
              ].map(envVar => (
                <div key={envVar} className="flex justify-between">
                  <span>{envVar}:</span>
                  <span className={process.env[envVar] ? 'text-green-600' : 'text-red-600'}>
                    {process.env[envVar] ? '✅ Set' : '❌ Missing'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}