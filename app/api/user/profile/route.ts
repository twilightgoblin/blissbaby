import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Return user data from Clerk
    const userData = {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName || user.firstName,
      avatar: user.imageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}