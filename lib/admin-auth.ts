import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export interface AdminUser {
  id: string
  email: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  clerkUserId: string
}

/**
 * Verify that the current user has admin access
 * Returns the admin user if authorized, throws error if not
 */
export async function verifyAdminAccess(): Promise<AdminUser> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('UNAUTHORIZED')
  }

  try {
    const user = await db.users.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        email: true,
        role: true,
        clerkUserId: true,
      },
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('ADMIN_ACCESS_REQUIRED')
    }

    return user as AdminUser
  } catch (error) {
    if (error instanceof Error && ['UNAUTHORIZED', 'USER_NOT_FOUND', 'ADMIN_ACCESS_REQUIRED'].includes(error.message)) {
      throw error
    }
    console.error('Error verifying admin access:', error)
    throw new Error('INTERNAL_ERROR')
  }
}

/**
 * Middleware helper for admin API routes
 * Returns NextResponse with error if not authorized, null if authorized
 */
export async function requireAdminAccess(): Promise<{ user: AdminUser } | NextResponse> {
  try {
    const user = await verifyAdminAccess()
    return { user }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'INTERNAL_ERROR'
    
    switch (errorMessage) {
      case 'UNAUTHORIZED':
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      case 'USER_NOT_FOUND':
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      case 'ADMIN_ACCESS_REQUIRED':
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      default:
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

/**
 * Check if a user has super admin privileges
 */
export function isSuperAdmin(user: AdminUser): boolean {
  return user.role === 'SUPER_ADMIN'
}