"use client"

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { getFCMToken, onMessageListener } from '@/lib/firebase'
import { toast } from 'sonner'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser()
  const listenerSetup = useRef(false)

  useEffect(() => {
    // Initialize FCM when user is signed in and component is mounted
    if (isSignedIn && user && typeof window !== 'undefined') {
      console.log('[NotificationProvider] User signed in, initializing FCM...')
      
      // Add a small delay to ensure environment variables are loaded
      const timer = setTimeout(() => {
        initializeFCM()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isSignedIn, user])

  const setupMessageListener = async () => {
    if (listenerSetup.current) {
      console.log('[NotificationProvider] Message listener already setup, skipping...')
      return
    }

    try {
      console.log('[NotificationProvider] Setting up foreground message listener...')
      listenerSetup.current = true

      // Setup listener that will continuously listen
      const listenForMessages = async () => {
        try {
          const payload: any = await onMessageListener()
          console.log('[NotificationProvider] 📨 Foreground message received:', payload)
          
          // Show toast notification
          toast(payload.notification?.title || 'New Notification', {
            description: payload.notification?.body,
            duration: 5000,
            action: payload.data?.url ? {
              label: 'View',
              onClick: () => {
                if (payload.data?.url) {
                  window.location.href = payload.data.url
                }
              },
            } : undefined,
          })

          // Continue listening for next message
          listenForMessages()
        } catch (error) {
          console.error('[NotificationProvider] Error in message listener:', error)
          // Retry after a delay
          setTimeout(listenForMessages, 1000)
        }
      }

      // Start listening
      listenForMessages()
      console.log('[NotificationProvider] ✅ Message listener active and waiting for messages')
    } catch (error) {
      console.error('[NotificationProvider] Failed to setup message listener:', error)
      listenerSetup.current = false
    }
  }

  const initializeFCM = async () => {
    try {
      console.log('[NotificationProvider] Starting FCM initialization...')
      
      // Check if notifications are already granted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        console.log('[NotificationProvider] Notification permission:', Notification.permission)
        
        if (Notification.permission === 'granted') {
          console.log('[NotificationProvider] Permission granted, getting FCM token...')
          const token = await getFCMToken()
          
          if (token) {
            console.log('[NotificationProvider] FCM token obtained:', token.substring(0, 30) + '...')
            
            // Save token to backend
            const response = await fetch('/api/notifications/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token,
                email: user?.emailAddresses[0]?.emailAddress,
                firstName: user?.firstName,
                lastName: user?.lastName,
              }),
            })
            
            if (response.ok) {
              console.log('[NotificationProvider] Token saved to database')
            } else {
              console.error('[NotificationProvider] Failed to save token:', await response.text())
            }
            
            // Setup foreground message listener
            await setupMessageListener()
          } else {
            console.warn('[NotificationProvider] Failed to get FCM token')
          }
        } else {
          console.log('[NotificationProvider] Notification permission not granted yet')
        }
      }
    } catch (error) {
      console.error('[NotificationProvider] Error initializing FCM:', error)
    }
  }

  return <>{children}</>
}