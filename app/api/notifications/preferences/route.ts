import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// GET /api/notifications/preferences - Get user notification preferences
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let user = await db.users.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        notificationEnabled: true,
        fcmToken: true,
      },
    })

    // If user doesn't exist, create them
    if (!user) {
      try {
        const clerkUser = await currentUser()
        if (!clerkUser) {
          return NextResponse.json(
            { error: 'User not found in Clerk' },
            { status: 404 }
          )
        }

        user = await db.users.create({
          data: {
            clerkUserId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            role: 'CUSTOMER',
            notificationEnabled: true,
          },
          select: {
            id: true,
            notificationEnabled: true,
            fcmToken: true,
          },
        })
      } catch (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      preferences: {
        notificationEnabled: user.notificationEnabled,
        hasToken: !!user.fcmToken,
      },
    })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications/preferences - Update user notification preferences
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { notificationEnabled } = await request.json()

    if (typeof notificationEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'notificationEnabled must be a boolean' },
        { status: 400 }
      )
    }

    // Try to update, if user doesn't exist, create them first
    let user
    try {
      user = await db.users.update({
        where: { clerkUserId: userId },
        data: {
          notificationEnabled,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          notificationEnabled: true,
          fcmToken: true,
        },
      })
    } catch (updateError: any) {
      // If user doesn't exist, create them
      if (updateError.code === 'P2025') {
        const clerkUser = await currentUser()
        if (!clerkUser) {
          return NextResponse.json(
            { error: 'User not found in Clerk' },
            { status: 404 }
          )
        }

        user = await db.users.create({
          data: {
            clerkUserId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            role: 'CUSTOMER',
            notificationEnabled,
          },
          select: {
            id: true,
            notificationEnabled: true,
            fcmToken: true,
          },
        })
      } else {
        throw updateError
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: {
        notificationEnabled: user.notificationEnabled,
        hasToken: !!user.fcmToken,
      },
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}