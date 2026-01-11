"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Shield, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function AdminSetup() {
  const { user, isSignedIn } = useUser()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [adminStatus, setAdminStatus] = useState({
    isAdmin: false,
    isAuthenticated: false,
    user: null as any,
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
        toast.error(data.error || 'Failed to setup admin access')
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
      <Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Access Required
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Admin Access Active
          </CardTitle>
          <CardDescription>
            You have admin privileges and can send notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Admin User:</strong> {adminStatus.user?.email}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Role: {adminStatus.user?.role} | 
              Notifications: {adminStatus.user?.hasNotifications ? '✅ Enabled' : '❌ Disabled'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Setup Admin Access
        </CardTitle>
        <CardDescription>
          Grant yourself admin privileges to send notifications and manage the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current User:</strong> {user?.emailAddresses[0]?.emailAddress}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              This will grant admin privileges to your account.
            </p>
          </div>
          
          <Button 
            onClick={setupAdmin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Shield className="h-4 w-4 mr-2 animate-spin" />
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