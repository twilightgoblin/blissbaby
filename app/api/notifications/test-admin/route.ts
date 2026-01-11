import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { sendNotificationToMultipleUsers } from '@/lib/firebase-admin'
import { isEmailAllowedAsAdmin, shouldAllowFirstUserAutoAdmin } from '@/lib/admin-config'

// POST /api/notifications/test-admin - Test admin notification sending
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    let adminUser = await db.users.findUnique({
      where: { clerkUserId: userId },
    })

    // If user doesn't exist, check if they can be auto-created as admin
    if (!adminUser) {
      try {
        const clerkUser = await currentUser()
        if (!clerkUser) {
          return NextResponse.json(
            { error: 'User not found in Clerk' },
            { status: 404 }
          )
        }
        
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress || ''

        // Check if this email is allowed or if it's the first user
        let canCreateAdmin = false
        
        if (isEmailAllowedAsAdmin(userEmail)) {
          canCreateAdmin = true
        } else if (shouldAllowFirstUserAutoAdmin()) {
          const userCount = await db.users.count()
          if (userCount === 0) {
            canCreateAdmin = true
          }
        }

        if (!canCreateAdmin) {
          return NextResponse.json(
            { error: 'Admin access required. Contact an administrator.' },
            { status: 403 }
          )
        }
        
        adminUser = await db.users.create({
          data: {
            clerkUserId: userId,
            email: userEmail,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            role: 'ADMIN',
            notificationEnabled: true,
          },
        })
      } catch (createError) {
        console.error('Error creating admin user:', createError)
        return NextResponse.json(
          { error: 'Failed to create admin user' },
          { status: 500 }
        )
      }
    }

    // Check if user has admin role
    if (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { title, body } = await request.json()

    // Get all admin users with FCM tokens
    const adminUsers = await db.users.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        fcmToken: { not: null },
        notificationEnabled: true,
      },
      select: {
        fcmToken: true,
        email: true,
      },
    })

    if (adminUsers.length === 0) {
      return NextResponse.json(
        { error: 'No admin users with notification tokens found' },
        { status: 404 }
      )
    }

    const adminTokens = adminUsers.map(user => user.fcmToken).filter(Boolean)
    
    const notificationTitle = title || '🧪 Admin Test Notification'
    const notificationBody = body || 'This is a test notification for admin users. The notification system is working correctly!'
    
    const result = await sendNotificationToMultipleUsers(
      adminTokens,
      notificationTitle,
      notificationBody,
      {
        type: 'admin_test',
        timestamp: new Date().toISOString(),
        url: '/admin/orders',
      }
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test notification sent to ${result.successCount} admin users`,
        successCount: result.successCount,
        failureCount: result.failureCount,
        adminEmails: adminUsers.map(u => u.email),
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test notification', details: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending test admin notification:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}