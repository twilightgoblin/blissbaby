"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFCMToken } from '@/lib/firebase'

export default function TestNotificationsPage() {
  const { isSignedIn, user } = useUser()
  const [status, setStatus] = useState<string>('Loading...')
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] = useState<string>('unknown')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    try {
      setStatus('Requesting permission...')
      
      // Request notification permission
      const permission = await Notification.requestPermission()
      setPermission(permission)
      
      if (permission === 'granted') {
        setStatus('Getting FCM token...')
        
        // Get FCM token
        const fcmToken = await getFCMToken()
        
        if (fcmToken) {
          setToken(fcmToken)
          setStatus('Saving token to database...')
          
          // Save token to backend
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
            setStatus('✅ Success! Notifications enabled.')
          } else {
            const error = await response.json()
            setStatus(`❌ Failed to save token: ${error.error}`)
          }
        } else {
          setStatus('❌ Failed to get FCM token')
        }
      } else {
        setStatus(`❌ Permission denied: ${permission}`)
      }
    } catch (error) {
      console.error('Error:', error)
      setStatus(`❌ Error: ${error}`)
    }
  }

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      })

      const data = await response.json()
      if (response.ok) {
        setStatus('✅ Test notification sent!')
      } else {
        setStatus(`❌ Failed to send: ${data.error}`)
      }
    } catch (error) {
      setStatus(`❌ Error sending test: ${error}`)
    }
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Please sign in to test notifications</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔔 Notification Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>User:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
            <p><strong>Browser Permission:</strong> {permission}</p>
            <p><strong>Status:</strong> {status}</p>
            {token && (
              <p><strong>FCM Token:</strong> {token.substring(0, 50)}...</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={requestPermission} disabled={permission === 'granted'}>
              {permission === 'granted' ? '✅ Permission Granted' : 'Request Permission'}
            </Button>
            
            {token && (
              <Button onClick={sendTestNotification} variant="secondary">
                Send Test Notification
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Debug Info:</strong></p>
            <p>• Browser supports notifications: {typeof window !== 'undefined' && 'Notification' in window ? 'Yes' : 'No'}</p>
            <p>• Service Worker supported: {typeof window !== 'undefined' && 'serviceWorker' in navigator ? 'Yes' : 'No'}</p>
            <p>• Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}