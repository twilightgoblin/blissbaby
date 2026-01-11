import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// POST /api/notifications/token - Save FCM token for user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { token, email, firstName, lastName } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      )
    }

    // Upsert user with FCM token
    const user = await db.users.upsert({
      where: { clerkUserId: userId },
      update: {
        fcmToken: token,
        updatedAt: new Date(),
      },
      create: {
        clerkUserId: userId,
        email: email || '',
        firstName: firstName || null,
        lastName: lastName || null,
        fcmToken: token,
        notificationEnabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'FCM token saved successfully',
      user: {
        id: user.id,
        fcmToken: user.fcmToken,
        notificationEnabled: user.notificationEnabled,
      },
    })
  } catch (error) {
    console.error('Error saving FCM token:', error)
    return NextResponse.json(
      { error: 'Failed to save FCM token' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/token - Remove FCM token for user
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await db.users.update({
      where: { clerkUserId: userId },
      data: {
        fcmToken: null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'FCM token removed successfully',
    })
  } catch (error) {
    console.error('Error removing FCM token:', error)
    return NextResponse.json(
      { error: 'Failed to remove FCM token' },
      { status: 500 }
    )
  }
}