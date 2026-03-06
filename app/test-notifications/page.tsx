"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Bell } from 'lucide-react'
import { toast } from 'sonner'

export default function TestNotificationsPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState({
    permission: 'unknown',
    serviceWorker: 'unknown',
    fcmToken: null as string | null,
    messagingSupported: false,
    firebaseInitialized: false
  })

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev])
    console.log(`[TEST] ${message}`)
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    addLog('Starting notification system check...')

    // Check notification permission
    if ('Notification' in window) {
      const perm = Notification.permission
      addLog(`Notification permission: ${perm}`)
      setStatus(prev => ({ ...prev, permission: perm }))
    } else {
      addLog('❌ Notifications not supported in this browser')
    }

    // Check service worker
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        addLog(`Found ${registrations.length} service worker(s)`)
        
        const fcmSW = registrations.find(reg => 
          reg.active?.scriptURL.includes('firebase-messaging-sw')
        )
        
        if (fcmSW) {
          addLog(`✅ Firebase service worker found: ${fcmSW.active?.state}`)
          setStatus(prev => ({ ...prev, serviceWorker: 'registered' }))
        } else {
          addLog('❌ Firebase service worker not found')
          setStatus(prev => ({ ...prev, serviceWorker: 'not-found' }))
        }
      } catch (error) {
        addLog(`❌ Error checking service worker: ${error}`)
      }
    } else {
      addLog('❌ Service workers not supported')
    }

    // Check Firebase
    try {
      const { getFCMToken } = await import('@/lib/firebase')
      addLog('Firebase module loaded')
      
      if (Notification.permission === 'granted') {
        addLog('Attempting to get FCM token...')
        const token = await getFCMToken()
        if (token) {
          addLog(`✅ FCM Token obtained: ${token.substring(0, 30)}...`)
          setStatus(prev => ({ ...prev, fcmToken: token, firebaseInitialized: true }))
        } else {
          addLog('❌ Failed to get FCM token')
        }
      } else {
        addLog('⚠️ Cannot get FCM token - permission not granted')
      }
    } catch (error) {
      addLog(`❌ Error with Firebase: ${error}`)
    }
  }

  const requestPermission = async () => {
    addLog('Requesting notification permission...')
    
    try {
      const permission = await Notification.requestPermission()
      addLog(`Permission result: ${permission}`)
      
      if (permission === 'granted') {
        addLog('✅ Permission granted! Getting FCM token...')
        const { getFCMToken } = await import('@/lib/firebase')
        const token = await getFCMToken()
        
        if (token) {
          addLog(`✅ FCM Token: ${token.substring(0, 30)}...`)
          setStatus(prev => ({ ...prev, fcmToken: token, permission: 'granted' }))
          
          // Save token
          addLog('Saving token to database...')
          const response = await fetch('/api/notifications/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          })
          
          if (response.ok) {
            addLog('✅ Token saved to database')
            toast.success('Notifications enabled!')
          } else {
            addLog('❌ Failed to save token to database')
          }
        } else {
          addLog('❌ Failed to get FCM token')
        }
      } else {
        addLog('❌ Permission denied')
      }
    } catch (error) {
      addLog(`❌ Error requesting permission: ${error}`)
    }
  }

  const sendTestNotification = async () => {
    addLog('Sending test notification via API...')
    
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addLog('✅ Test notification sent successfully')
        toast.success('Test notification sent! Check your notifications.')
      } else {
        addLog(`❌ Failed to send: ${data.error}`)
        toast.error(data.error)
      }
    } catch (error) {
      addLog(`❌ Error sending test: ${error}`)
    }
  }

  const showBrowserNotification = () => {
    addLog('Attempting to show browser notification directly...')
    
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('Test Notification', {
          body: 'This is a direct browser notification test',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'test'
        })
        
        notification.onclick = () => {
          addLog('Notification clicked!')
          window.focus()
          notification.close()
        }
        
        addLog('✅ Browser notification shown')
      } catch (error) {
        addLog(`❌ Error showing notification: ${error}`)
      }
    } else {
      addLog('❌ Cannot show notification - permission not granted')
      toast.error('Please enable notifications first')
    }
  }

  const registerServiceWorker = async () => {
    addLog('Manually registering service worker...')
    
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        })
        addLog(`✅ Service worker registered: ${registration.scope}`)
        
        await navigator.serviceWorker.ready
        addLog('✅ Service worker ready')
        
        setStatus(prev => ({ ...prev, serviceWorker: 'registered' }))
        toast.success('Service worker registered!')
      } catch (error) {
        addLog(`❌ Service worker registration failed: ${error}`)
        toast.error('Service worker registration failed')
      }
    }
  }

  const setupMessageListener = async () => {
    addLog('Setting up foreground message listener...')
    
    try {
      const { onMessageListener } = await import('@/lib/firebase')
      
      onMessageListener().then((payload: any) => {
        addLog(`📨 Foreground message received!`)
        addLog(`Title: ${payload.notification?.title}`)
        addLog(`Body: ${payload.notification?.body}`)
        
        toast(payload.notification?.title || 'New Notification', {
          description: payload.notification?.body
        })
      }).catch((error) => {
        addLog(`❌ Error setting up listener: ${error}`)
      })
      
      addLog('✅ Message listener setup complete')
    } catch (error) {
      addLog(`❌ Error with message listener: ${error}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification System Test</h1>
        <p className="text-muted-foreground">Debug and test push notifications</p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Permission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {status.permission === 'granted' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : status.permission === 'denied' ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <Badge variant={status.permission === 'granted' ? 'default' : 'secondary'}>
                {status.permission}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Service Worker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {status.serviceWorker === 'registered' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <Badge variant={status.serviceWorker === 'registered' ? 'default' : 'secondary'}>
                {status.serviceWorker}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">FCM Token</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {status.fcmToken ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <Badge variant={status.fcmToken ? 'default' : 'secondary'}>
                {status.fcmToken ? 'obtained' : 'none'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
          <CardDescription>Run these tests in order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Button onClick={checkStatus} variant="outline">
              1. Check Status
            </Button>
            <Button onClick={registerServiceWorker} variant="outline">
              2. Register Service Worker
            </Button>
            <Button onClick={requestPermission} variant="outline">
              3. Request Permission
            </Button>
            <Button onClick={setupMessageListener} variant="outline">
              4. Setup Listener
            </Button>
            <Button onClick={showBrowserNotification} variant="outline">
              5. Test Browser Notification
            </Button>
            <Button onClick={sendTestNotification}>
              6. Send Test via API
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
          <CardDescription>Real-time notification system logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Click "Check Status" to start.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Token Display */}
      {status.fcmToken && (
        <Card>
          <CardHeader>
            <CardTitle>FCM Token</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded font-mono text-xs break-all">
              {status.fcmToken}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
