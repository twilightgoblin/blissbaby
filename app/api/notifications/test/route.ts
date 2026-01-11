import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { sendNotificationToUser } from '@/lib/firebase-admin'

// POST /api/notifications/test - Test notification sending
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's FCM token
    const user = await db.users.findUnique({
      where: { clerkUserId: userId },
      select: {
        fcmToken: true,
        notificationEnabled: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please enable notifications first.' },
        { status: 404 }
      )
    }

    if (!user.fcmToken) {
      return NextResponse.json(
        { error: 'No FCM token found. Please enable notifications first.' },
        { status: 400 }
      )
    }

    if (!user.notificationEnabled) {
      return NextResponse.json(
        { error: 'Notifications are disabled for this user.' },
        { status: 400 }
      )
    }

    // Send test notification
    const result = await sendNotificationToUser(
      user.fcmToken,
      '🧪 Test Notification',
      'This is a test notification from BabyBliss! Your notifications are working correctly.',
      {
        type: 'test',
        timestamp: new Date().toISOString(),
        url: '/profile/notifications',
      }
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully!',
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test notification', details: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}