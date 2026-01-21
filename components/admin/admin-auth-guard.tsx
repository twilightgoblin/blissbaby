"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Shield, AlertCircle, Home } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClerkSignInButton } from "@/components/clerk-wrapper"

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [adminStatus, setAdminStatus] = useState<{
    isAdmin: boolean
    isAuthenticated: boolean
    loading: boolean
    error?: string
    allowSetup?: boolean
  }>({
    isAdmin: false,
    isAuthenticated: false,
    loading: true,
  })

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setAdminStatus({
        isAdmin: false,
        isAuthenticated: false,
        loading: false,
      })
      return
    }

    checkAdminStatus()
  }, [isSignedIn, isLoaded])

  const checkAdminStatus = async () => {
    try {
      setAdminStatus(prev => ({ ...prev, loading: true }))
      
      const response = await fetch('/api/admin/check')
      const data = await response.json()

      setAdminStatus({
        isAdmin: data.isAdmin,
        isAuthenticated: data.isAuthenticated,
        loading: false,
        error: data.isAdmin ? undefined : 'Admin access required',
        allowSetup: data.isAuthenticated && !data.isAdmin,
      })
    } catch (error) {
      console.error('Error checking admin status:', error)
      setAdminStatus({
        isAdmin: false,
        isAuthenticated: false,
        loading: false,
        error: 'Failed to verify admin access',
        allowSetup: false,
      })
    }
  }

  // Loading state
  if (!isLoaded || adminStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying Access
            </CardTitle>
            <CardDescription>
              Checking admin permissions...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
            <CardDescription>
              Please sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ClerkSignInButton className="w-full">
              Sign In
            </ClerkSignInButton>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Signed in but not admin
  if (!adminStatus.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              <p>Signed in as: <strong>{user?.emailAddresses[0]?.emailAddress}</strong></p>
              <p className="mt-2">Only authorized administrators can access this area.</p>
            </div>
            
            {adminStatus.allowSetup && (
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/admin/setup', { method: 'POST' })
                      if (response.ok) {
                        checkAdminStatus()
                      } else {
                        const error = await response.json()
                        alert(error.error || 'Failed to setup admin access')
                      }
                    } catch (error) {
                      alert('Failed to setup admin access')
                    }
                  }}
                >
                  Request Admin Access
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  This will only work if your email is authorized or if you're the first user
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={checkAdminStatus}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin access granted
  return <>{children}</>
}