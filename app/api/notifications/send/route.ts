import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { sendNotificationToUser, sendNotificationToMultipleUsers } from '@/lib/firebase-admin'
import { isEmailAllowedAsAdmin, shouldAllowFirstUserAutoAdmin } from '@/lib/admin-config'

// POST /api/notifications/send - Send notification to specific user(s)
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

    const { 
      userIds, 
      title, 
      body, 
      data,
      sendToAll = false 
    } = await request.json()

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    let targetUsers = []

    if (sendToAll) {
      // Send to all users - include users without FCM tokens but show warning
      const allUsers = await db.users.findMany({
        where: {
          notificationEnabled: true,
        },
        select: {
          id: true,
          clerkUserId: true,
          fcmToken: true,
          email: true,
        },
      })

      // Filter users with FCM tokens for actual sending
      targetUsers = allUsers.filter(user => user.fcmToken)
      
      // Log info about users without tokens
      const usersWithoutTokens = allUsers.filter(user => !user.fcmToken)
      if (usersWithoutTokens.length > 0) {
        console.log(`${usersWithoutTokens.length} users don't have FCM tokens:`, 
          usersWithoutTokens.map(u => u.email))
      }
    } else if (userIds && userIds.length > 0) {
      // Send to specific users
      targetUsers = await db.users.findMany({
        where: {
          clerkUserId: { in: userIds },
          fcmToken: { not: null },
          notificationEnabled: true,
        },
        select: {
          id: true,
          clerkUserId: true,
          fcmToken: true,
          email: true,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'No target users specified' },
        { status: 400 }
      )
    }

    if (targetUsers.length === 0) {
      // Check if there are any users at all
      const totalUsers = await db.users.count({
        where: { notificationEnabled: true }
      })
      
      if (totalUsers === 0) {
        return NextResponse.json(
          { 
            error: 'No users found in database. Users will be created automatically when they sign up.',
            suggestion: 'Make sure Clerk webhook is configured to sync users to database.'
          },
          { status: 404 }
        )
      } else {
        return NextResponse.json(
          { 
            error: `Found ${totalUsers} users but none have FCM tokens for push notifications`,
            suggestion: 'Users need to enable notifications in their profile settings.'
          },
          { status: 404 }
        )
      }
    }

    const tokens = targetUsers.map(user => user.fcmToken).filter(Boolean)

    // Send notifications
    const result = await sendNotificationToMultipleUsers(
      tokens,
      title,
      body,
      data
    )

    return NextResponse.json({
      success: true,
      message: 'Notifications sent successfully',
      result: {
        totalUsers: targetUsers.length,
        successCount: result.successCount,
        failureCount: result.failureCount,
      },
    })
  } catch (error) {
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}