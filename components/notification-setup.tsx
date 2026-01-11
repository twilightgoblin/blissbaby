"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Bell, BellOff, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useNotifications } from '@/hooks/use-notifications'
import { toast } from 'sonner'

export function NotificationSetup() {
  const { isSignedIn } = useUser()
  const {
    permission,
    token,
    loading,
    requestPermission,
    disableNotifications,
    isSupported,
  } = useNotifications()

  const [preferences, setPreferences] = useState({
    notificationEnabled: true,
    hasToken: false,
  })
  const [loadingPrefs, setLoadingPrefs] = useState(false)

  // Fetch user preferences
  useEffect(() => {
    if (isSignedIn) {
      fetchPreferences()
    }
  }, [isSignedIn])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  const updatePreferences = async (notificationEnabled: boolean) => {
    try {
      setLoadingPrefs(true)
      
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationEnabled }),
      })

      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
        toast.success('Preferences updated successfully!')
      } else {
        toast.error('Failed to update preferences')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences')
    } finally {
      setLoadingPrefs(false)
    }
  }

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Test notification sent! Check your device.')
      } else {
        toast.error(data.error || 'Failed to send test notification')
      }
    } catch (error) {
      console.error('Error sending test notification:', error)
      toast.error('Failed to send test notification')
    }
  }

  if (!isSignedIn) {
    return null
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about new offers, order updates, and important announcements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {permission.granted
                ? 'Notifications are enabled'
                : permission.denied
                ? 'Notifications are blocked'
                : 'Notifications permission not granted'}
            </p>
          </div>
          <Switch
            id="notifications-enabled"
            checked={preferences.notificationEnabled && permission.granted}
            onCheckedChange={updatePreferences}
            disabled={loadingPrefs || !permission.granted}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!permission.granted && (
            <Button
              onClick={requestPermission}
              disabled={loading || permission.denied}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          )}

          {permission.granted && token && (
            <>
              <Button
                variant="outline"
                onClick={disableNotifications}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <BellOff className="h-4 w-4" />
                {loading ? 'Disabling...' : 'Disable Notifications'}
              </Button>
              
              <Button
                variant="secondary"
                onClick={sendTestNotification}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Test Notification
              </Button>
            </>
          )}
        </div>

        {/* Status Information */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Status: {
            permission.granted && token
              ? '✅ Active'
              : permission.denied
              ? '❌ Blocked'
              : '⏳ Not enabled'
          }</p>
          {token && (
            <p className="font-mono text-xs break-all">
              Token: {token.substring(0, 20)}...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}