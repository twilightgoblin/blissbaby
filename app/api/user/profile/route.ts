import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Since we have the userId from auth, we can construct basic user data
    // For more detailed user info, we'd need to call Clerk's API or store user data in our DB
    const userData = {
      id: userId,
      // Note: auth() doesn't provide email/name, only userId
      // You might want to store additional user data in your database
      // or make a separate call to Clerk's API for full user details
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