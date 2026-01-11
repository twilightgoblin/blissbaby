"use client"

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, X, Gift } from 'lucide-react'
import { toast } from 'sonner'

export function AutoNotificationSetup() {
  const { isSignedIn, user } = useUser()
  const { permission, requestPermission, isSupported } = useNotifications()
  const [showPrompt, setShowPrompt] = useState(false)
  const [hasShownPrompt, setHasShownPrompt] = useState(false)

  useEffect(() => {
    // Only show prompt for signed-in users who haven't been prompted yet
    if (isSignedIn && user && isSupported && permission.default && !hasShownPrompt) {
      // Wait 5-6 seconds, then show the notification prompt
      const timer = setTimeout(() => {
        setShowPrompt(true)
        setHasShownPrompt(true)
      }, 5500) // 5.5 second delay

      return () => clearTimeout(timer)
    }
  }, [isSignedIn, user, isSupported, permission.default, hasShownPrompt])

  const handleAllow = async () => {
    setShowPrompt(false)
    const success = await requestPermission()
    
    if (success) {
      toast.success('🎉 Great! You\'ll now receive notifications about exclusive offers and deals!')
    } else {
      toast.error('Notifications were not enabled. You can enable them later in your profile settings.')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    toast.info('You can enable notifications anytime from your profile settings.')
  }

  // Don't render anything if prompt shouldn't be shown
  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Gift className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">🎁 Never Miss Amazing Deals!</CardTitle>
          <CardDescription className="text-base">
            Get instant notifications about exclusive offers, flash sales, and new baby products just for you!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-3 text-sm">
              <Bell className="h-4 w-4 text-primary" />
              <span className="font-medium">What you'll get:</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground ml-7">
              <li>• Exclusive discount codes</li>
              <li>• Flash sale alerts</li>
              <li>• New product launches</li>
              <li>• Order updates</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleAllow}
              className="flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              Allow Notifications
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            You can change this anytime in your profile settings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}