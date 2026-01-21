import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { isEmailAllowedAsAdmin, shouldAllowSelfServiceAdmin, shouldAllowFirstUserAutoAdmin } from '@/lib/admin-config'

// POST /api/admin/setup - Setup current user as admin
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user info from Clerk
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress || ''

    // Check if user already has admin access
    const existingUser = await db.users.findUnique({
      where: { clerkUserId: userId },
      select: { role: true }
    })

    if (existingUser && (existingUser.role === 'ADMIN' || existingUser.role === 'SUPER_ADMIN')) {
      return NextResponse.json({
        success: true,
        message: 'User already has admin access',
        user: { email: userEmail, role: existingUser.role }
      })
    }

    // Check if self-service admin setup is allowed
    if (!shouldAllowSelfServiceAdmin()) {
      // Check if this email is in the allowed list
      if (!isEmailAllowedAsAdmin(userEmail)) {
        // Check if this is the first user and first user auto-admin is enabled
        if (shouldAllowFirstUserAutoAdmin()) {
          const userCount = await db.users.count()
          if (userCount > 0) {
            return NextResponse.json(
              { error: 'Admin access restricted. Contact an administrator.' },
              { status: 403 }
            )
          }
          // First user - allow admin access
        } else {
          return NextResponse.json(
            { error: 'Admin access restricted. Your email is not authorized.' },
            { status: 403 }
          )
        }
      }
    }

    // Create or update user in database with admin role
    const user = await db.users.upsert({
      where: { clerkUserId: userId },
      update: {
        role: 'ADMIN',
        email: userEmail,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        updatedAt: new Date(),
      },
      create: {
        clerkUserId: userId,
        email: userEmail,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        role: 'ADMIN',
        notificationEnabled: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin access granted successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      },
    })
  } catch (error) {
    console.error('Error setting up admin:', error)
    return NextResponse.json(
      { error: 'Failed to setup admin access' },
      { status: 500 }
    )
  }
}