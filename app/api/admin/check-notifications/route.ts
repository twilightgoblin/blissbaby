import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { isEmailAllowedAsAdmin } from '@/lib/admin-config'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const clerkUser = await currentUser()
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || ''
    
    if (!isEmailAllowedAsAdmin(userEmail)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check notification setup
    const totalUsers = await db.users.count()
    const usersWithTokens = await db.users.count({
      where: { fcmToken: { not: null } }
    })
    const usersWithNotificationsEnabled = await db.users.count({
      where: { notificationEnabled: true }
    })
    const adminUsers = await db.users.count({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
    })
    const adminUsersWithTokens = await db.users.count({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        fcmToken: { not: null },
        notificationEnabled: true
      }
    })

    // Get all users with their notification status
    const users = await db.users.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        fcmToken: true,
        notificationEnabled: true,
        firstName: true,
        lastName: true
      }
    })

    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_VAPID_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        usersWithTokens,
        usersWithNotificationsEnabled,
        adminUsers,
        adminUsersWithTokens
      },
      users: users.map(user => ({
        email: user.email,
        role: user.role,
        hasToken: !!user.fcmToken,
        tokenPreview: user.fcmToken ? user.fcmToken.substring(0, 20) + '...' : null,
        notificationEnabled: user.notificationEnabled,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'
      })),
      envVars
    })
  } catch (error) {
    console.error('Error checking notification setup:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check notification setup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
