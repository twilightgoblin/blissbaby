"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationStatus {
  stats: {
    totalUsers: number
    usersWithTokens: number
    usersWithNotificationsEnabled: number
    adminUsers: number
    adminUsersWithTokens: number
  }
  users: Array<{
    email: string
    role: string
    hasToken: boolean
    tokenPreview: string | null
    notificationEnabled: boolean
    name: string
  }>
  envVars: Record<string, boolean>
}

export default function NotificationDebugPage() {
  const [status, setStatus] = useState<NotificationStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/check-notifications')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else {
        toast.error('Failed to fetch notification status')
      }
    } catch (error) {
      console.error('Error fetching status:', error)
      toast.error('Failed to fetch notification status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">Failed to load notification status</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification System Debug</h1>
          <p className="text-muted-foreground">Check notification setup and user token status</p>
        </div>
        <Button onClick={fetchStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{status.stats.usersWithTokens}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{status.stats.usersWithNotificationsEnabled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{status.stats.adminUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admins w/ Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{status.stats.adminUsersWithTokens}</div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Firebase configuration status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {Object.entries(status.envVars).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-mono">{key}</span>
                {value ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>User Notification Status</CardTitle>
          <CardDescription>Individual user token and notification settings</CardDescription>
        </CardHeader>
        <CardContent>
          {status.users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found in database</p>
              <p className="text-sm">Users will be created when they sign up</p>
            </div>
          ) : (
            <div className="space-y-2">
              {status.users.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.email}</span>
                      <Badge variant={user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{user.name}</div>
                    {user.tokenPreview && (
                      <div className="text-xs font-mono text-muted-foreground mt-1">
                        Token: {user.tokenPreview}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Token</div>
                      {user.hasToken ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Enabled</div>
                      {user.notificationEnabled ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">For Users to Receive Notifications:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>User must sign up/login</li>
              <li>Visit notification settings or profile page</li>
              <li>Click "Enable Notifications"</li>
              <li>Grant browser permission when prompted</li>
              <li>FCM token will be automatically saved</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">For Admins to Receive Order Notifications:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Admin must have ADMIN or SUPER_ADMIN role</li>
              <li>Admin must enable notifications (same as users)</li>
              <li>When a user completes an order, admin will receive notification</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> If no users have tokens, they need to enable notifications first. 
              Visit the notification settings page and click "Enable Notifications".
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
