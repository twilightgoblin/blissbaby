"use client"

import { NotificationDashboard } from "@/components/admin/notification-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Users, TrendingUp } from "lucide-react"

export default function AdminNotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Notification Management</h1>
          <p className="text-muted-foreground">
            Send push notifications to users and manage notification settings.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Loading...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications Enabled</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Loading...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Loading...
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <NotificationDashboard />
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Latest notifications sent to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent notifications</p>
                  <p className="text-sm">Sent notifications will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notification Guidelines</CardTitle>
            <CardDescription>
              Best practices for sending effective notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">✅ Do's</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep titles under 50 characters</li>
                  <li>• Use clear, actionable language</li>
                  <li>• Include relevant emojis for engagement</li>
                  <li>• Send at optimal times (9 AM - 6 PM)</li>
                  <li>• Personalize when possible</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">❌ Don'ts</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Don't send more than 3 per day</li>
                  <li>• Avoid all caps or excessive punctuation</li>
                  <li>• Don't send during late hours</li>
                  <li>• Avoid generic or spammy content</li>
                  <li>• Don't ignore user preferences</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}