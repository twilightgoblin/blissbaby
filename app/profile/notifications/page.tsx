"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NotificationSetup } from "@/components/notification-setup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Settings } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
              <Settings className="h-8 w-8" />
              Notification Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your push notification preferences and stay updated with the latest offers and order updates.
            </p>
          </div>

          <NotificationSetup />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                What You'll Receive
              </CardTitle>
              <CardDescription>
                Here's what types of notifications you can expect:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <h4 className="font-medium">New Offers & Discounts</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new banners, discount codes, and special offers are available.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <h4 className="font-medium">Order Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Stay informed about your order status, shipping updates, and delivery confirmations.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <div>
                    <h4 className="font-medium">Product Restocks</h4>
                    <p className="text-sm text-muted-foreground">
                      Be the first to know when your favorite products are back in stock.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                  <div>
                    <h4 className="font-medium">Important Announcements</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about policy changes, new features, and important store information.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Your notification preferences and data are secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • We only send relevant notifications based on your activity and preferences
              </p>
              <p className="text-sm text-muted-foreground">
                • Your notification token is encrypted and stored securely
              </p>
              <p className="text-sm text-muted-foreground">
                • You can disable notifications at any time from this page
              </p>
              <p className="text-sm text-muted-foreground">
                • We never share your notification data with third parties
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}