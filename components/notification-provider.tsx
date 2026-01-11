"use client"

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { getFCMToken } from '@/lib/firebase'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser()

  useEffect(() => {
    // Initialize FCM when user is signed in and component is mounted
    if (isSignedIn && user && typeof window !== 'undefined') {
      // Add a small delay to ensure environment variables are loaded
      const timer = setTimeout(() => {
        initializeFCM()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isSignedIn, user])

  const initializeFCM = async () => {
    try {
      // Check if notifications are already granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const token = await getFCMToken()
        
        if (token) {
          // Save token to backend
          await fetch('/api/notifications/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              email: user?.emailAddresses[0]?.emailAddress,
              firstName: user?.firstName,
              lastName: user?.lastName,
            }),
          }).catch(error => {
            console.error('Failed to save FCM token:', error)
          })
        }
      }
    } catch (error) {
      console.error('Error initializing FCM:', error)
    }
  }

  return <>{children}</>
}