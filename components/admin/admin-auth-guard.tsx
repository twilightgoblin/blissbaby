"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Shield, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SignInButton } from "@clerk/nextjs"

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
        allowSetup: data.isAuthenticated && !data.isAdmin, // Allow setup if authenticated but not admin
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
              Please sign in to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignInButton mode="modal">
              <Button className="w-full">
                Sign In to Continue
              </Button>
            </SignInButton>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/')}
            >
              Back to Store
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not admin but authenticated - show setup if allowed
  if (!adminStatus.isAdmin && adminStatus.allowSetup) {
    return <>{children}</>
  }

  // Not admin
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
              You don't have admin privileges to access this area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Current user: {user?.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact an administrator to request access
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push('/')}
              >
                Back to Store
              </Button>
              <Button 
                variant="default" 
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