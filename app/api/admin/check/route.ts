import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// GET /api/admin/check - Check if current user has admin access
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({
        isAdmin: false,
        isAuthenticated: false,
        message: 'Not authenticated'
      })
    }

    // Check if user exists and has admin role
    const user = await db.users.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        email: true,
        role: true,
        fcmToken: true,
        notificationEnabled: true,
      },
    })

    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')

    return NextResponse.json({
      isAdmin,
      isAuthenticated: true,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        hasNotifications: !!user.fcmToken,
        notificationEnabled: user.notificationEnabled,
      } : null,
      message: isAdmin ? 'Admin access confirmed' : 'No admin access'
    })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json(
      { 
        isAdmin: false,
        isAuthenticated: false,
        error: 'Failed to check admin status' 
      },
      { status: 500 }
    )
  }
}