"use client"

import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ClerkSignInButton } from "@/components/clerk-wrapper"

export function AdminRedirectAlert() {
  const searchParams = useSearchParams()
  const adminRedirect = searchParams.get('admin_redirect')

  if (!adminRedirect) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <span>You need to sign in to access the admin dashboard.</span>
            <div className="ml-4">
              <ClerkSignInButton size="sm">
                Sign In
              </ClerkSignInButton>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}