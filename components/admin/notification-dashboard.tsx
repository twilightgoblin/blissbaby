"use client"

import { useState } from 'react'
import { Send, Users, Bell, Gift, Percent, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const OFFER_TEMPLATES = [
  {
    id: 'flash_sale',
    icon: Zap,
    title: '⚡ Flash Sale Alert!',
    body: 'Limited time offer! Get up to 50% off on baby essentials. Hurry, sale ends soon!',
    type: 'flash_sale',
    color: 'bg-red-500'
  },
  {
    id: 'new_arrivals',
    icon: Star,
    title: '✨ New Arrivals Just In!',
    body: 'Discover the latest baby products that every parent is talking about. Shop now!',
    type: 'new_products',
    color: 'bg-blue-500'
  },
  {
    id: 'exclusive_discount',
    icon: Percent,
    title: '🎁 Exclusive Discount for You!',
    body: 'Special 30% discount just for our valued customers. Use code: BABY30',
    type: 'discount',
    color: 'bg-green-500'
  },
  {
    id: 'weekend_special',
    icon: Gift,
    title: '🛍️ Weekend Special Deals!',
    body: 'Weekend vibes with amazing deals on baby care products. Don\'t miss out!',
    type: 'weekend_offer',
    color: 'bg-purple-500'
  }
]

export function NotificationDashboard() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    sendToAll: true,
    userIds: '',
    type: 'custom'
  })

  const handleTemplateSelect = (template: typeof OFFER_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      body: template.body,
      type: template.type
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.body) {
      toast.error('Title and message are required')
      return
    }

    try {
      setLoading(true)

      const payload = {
        title: formData.title,
        body: formData.body,
        sendToAll: formData.sendToAll,
        userIds: formData.sendToAll ? [] : formData.userIds.split(',').map(id => id.trim()).filter(Boolean),
        data: {
          type: formData.type,
          timestamp: new Date().toISOString(),
          url: formData.type === 'flash_sale' ? '/products?sale=true' : '/products'
        },
      }

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`🎉 Offer notification sent to ${data.result.successCount} users!`)
        setFormData({
          title: '',
          body: '',
          sendToAll: true,
          userIds: '',
          type: 'custom'
        })
      } else {
        toast.error(data.error || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Send Offer Notifications
        </CardTitle>
        <CardDescription>
          Send push notifications to users about new offers, deals, and exclusive discounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Templates */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Offer Templates</Label>
          <div className="grid grid-cols-2 gap-2">
            {OFFER_TEMPLATES.map((template) => {
              const Icon = template.icon
              return (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                  className="h-auto p-3 text-left justify-start"
                >
                  <div className={`w-2 h-2 rounded-full ${template.color} mr-2 flex-shrink-0`} />
                  <div className="min-w-0">
                    <div className="font-medium text-xs truncate">{template.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{template.body.substring(0, 30)}...</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              placeholder="e.g., 🎁 Special Offer Just for You!"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              placeholder="e.g., Get 30% off on all baby products! Limited time offer. Shop now and save big!"
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="send-to-all"
              checked={formData.sendToAll}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendToAll: checked }))}
            />
            <Label htmlFor="send-to-all">Send to all users</Label>
            <Badge variant="secondary" className="ml-2">
              <Users className="h-3 w-3 mr-1" />
              All Users
            </Badge>
          </div>

          {!formData.sendToAll && (
            <div className="space-y-2">
              <Label htmlFor="user-ids">User IDs (comma-separated)</Label>
              <Input
                id="user-ids"
                placeholder="user_123, user_456, user_789"
                value={formData.userIds}
                onChange={(e) => setFormData(prev => ({ ...prev, userIds: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Enter Clerk user IDs separated by commas
              </p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Send className="h-4 w-4 mr-2 animate-spin" />
                Sending Offer...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Send Offer Notification
              </>
            )}
          </Button>
        </form>

        {/* Tips */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">💡 Offer Notification Tips</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use emojis to make offers more appealing</li>
            <li>• Include urgency words like "Limited time" or "Hurry"</li>
            <li>• Mention specific discounts (30% off, Buy 1 Get 1)</li>
            <li>• Keep titles under 50 characters for mobile</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}