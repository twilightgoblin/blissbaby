'use client'

import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestClerkPage() {
  const { user, isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Clerk Authentication Test</CardTitle>
          <CardDescription>
            Testing Clerk integration with the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isSignedIn ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <UserButton />
                <div>
                  <h3 className="font-semibold">Welcome, {user.fullName || user.firstName}!</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Created:</strong> {user.createdAt?.toLocaleDateString()}</p>
                <p><strong>Last Sign In:</strong> {user.lastSignInAt?.toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p>You are not signed in.</p>
              <div className="flex gap-4 justify-center">
                <SignInButton mode="modal">
                  <Button variant="outline">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Sign Up</Button>
                </SignUpButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}