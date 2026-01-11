"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Shield, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface AdminStatus {
  isAdmin: boolean
  isAuthenticated: boolean
  user: {
    id: string
    email: string
    role: string
    hasNotifications: boolean
    notificationEnabled: boolean
  } | null
}

export function AdminSetupCard() {
  const { user, isSignedIn } = useUser()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    isAdmin: false,
    isAuthenticated: false,
    user: null,
  })

  useEffect(() => {
    if (isSignedIn) {
      checkAdminStatus()
    } else {
      setChecking(false)
    }
  }, [isSignedIn])

  const checkAdminStatus = async () => {
    try {
      setChecking(true)
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      setAdminStatus(data)
    } catch (error) {
      console.error('Error checking admin status:', error)
    } finally {
      setChecking(false)
    }
  }

  const setupAdmin = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in first')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/admin/setup', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setAdminStatus(prev => ({ ...prev, isAdmin: true }))
        toast.success('Admin access granted successfully!')
        // Refresh the status
        await checkAdminStatus()
      } else {
        if (response.status === 403) {
          toast.error(data.error || 'Admin access restricted')
        } else {
          toast.error(data.error || 'Failed to setup admin access')
        }
      }
    } catch (error) {
      console.error('Error setting up admin:', error)
      toast.error('Failed to setup admin access')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <Card className="rounded-3xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking Admin Status...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!isSignedIn) {
    return (
      <Card className="rounded-3xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Authentication Required
          </CardTitle>
          <CardDescription>
            Please sign in to access admin features.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (adminStatus.isAdmin) {
    return (
      <Card className="rounded-3xl border-border/60 bg-green-50/50 border-green-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Admin Access Active
          </CardTitle>
          <CardDescription>
            You have admin privileges and full access to all features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-100/50 rounded-xl">
            <p className="text-sm text-green-800">
              <strong>Admin User:</strong> {adminStatus.user?.email}
            </p>
            <p className="text-sm text-green-700 mt-1">
              Role: {adminStatus.user?.role} | 
              Notifications: {adminStatus.user?.hasNotifications ? '✅ Enabled' : '❌ Disabled'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-3xl border-border/60 bg-blue-50/50 border-blue-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Shield className="h-5 w-5" />
          Setup Admin Access
        </CardTitle>
        <CardDescription>
          Grant yourself admin privileges to manage the system and send notifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-blue-100/50 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Current User:</strong> {user?.emailAddresses[0]?.emailAddress}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              This will grant admin privileges to your account.
            </p>
          </div>
          
          <Button 
            onClick={setupAdmin} 
            disabled={loading}
            className="w-full rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Grant Admin Access
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}