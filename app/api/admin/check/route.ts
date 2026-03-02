import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAccess } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// GET /api/admin/check - Check if current user has admin access
export async function GET(request: NextRequest) {
  try {
    const result = await requireAdminAccess()
    
    if (result instanceof NextResponse) {
      // Not authorized - return user-friendly response for check endpoint
      return NextResponse.json({
        isAdmin: false,
        isAuthenticated: false,
        message: 'Admin access required'
      })
    }

    const { user } = result

    // Fetch notification status
    const userWithNotifications = await db.users.findUnique({
      where: { id: user.id },
      select: {
        fcmToken: true,
        notificationEnabled: true,
      },
    })

    return NextResponse.json({
      isAdmin: true,
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        hasNotifications: !!(userWithNotifications?.fcmToken && userWithNotifications?.notificationEnabled),
        notificationEnabled: userWithNotifications?.notificationEnabled || false,
      },
      message: 'Admin access confirmed'
    })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({
      isAdmin: false,
      isAuthenticated: false,
      message: 'Error verifying admin access'
    }, { status: 500 })
  }
}