"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { getFCMToken, onMessageListener } from '@/lib/firebase'
import { toast } from 'sonner'

interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export function useNotifications() {
  const { user, isSignedIn } = useUser()
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  })
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default',
      })
    }
  }, [])

  // Request notification permission and get FCM token
  const requestPermission = async () => {
    if (!isSignedIn || !user) {
      toast.error('Please sign in to enable notifications')
      return false
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Notifications are not supported in this browser')
      return false
    }

    try {
      setLoading(true)

      // Request permission
      const permission = await Notification.requestPermission()
      
      setPermission({
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default',
      })

      if (permission === 'granted') {
        // Get FCM token
        const fcmToken = await getFCMToken()
        
        if (fcmToken) {
          setToken(fcmToken)
          
          // Save token to backend
          const response = await fetch('/api/notifications/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: fcmToken,
              email: user.emailAddresses[0]?.emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
            }),
          })

          if (response.ok) {
            toast.success('Notifications enabled successfully!')
            return true
          } else {
            toast.error('Failed to save notification token')
            return false
          }
        } else {
          toast.error('Failed to get notification token')
          return false
        }
      } else {
        toast.error('Notification permission denied')
        return false
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error('Failed to enable notifications')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Disable notifications
  const disableNotifications = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/notifications/token', {
        method: 'DELETE',
      })

      if (response.ok) {
        setToken(null)
        toast.success('Notifications disabled successfully!')
        return true
      } else {
        toast.error('Failed to disable notifications')
        return false
      }
    } catch (error) {
      console.error('Error disabling notifications:', error)
      toast.error('Failed to disable notifications')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Listen for foreground messages
  useEffect(() => {
    if (permission.granted && token) {
      const unsubscribe = onMessageListener()
        .then((payload: any) => {
          console.log('Received foreground message:', payload)
          
          // Show toast notification
          toast(payload.notification?.title || 'New Notification', {
            description: payload.notification?.body,
            action: payload.data?.url ? {
              label: 'View',
              onClick: () => window.open(payload.data.url, '_blank'),
            } : undefined,
          })
        })
        .catch((error) => {
          console.error('Error listening for messages:', error)
        })

      return () => {
        // Cleanup if needed
      }
    }
  }, [permission.granted, token])

  return {
    permission,
    token,
    loading,
    requestPermission,
    disableNotifications,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
  }
}