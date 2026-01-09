import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Since we're using Clerk for user management, we'll return basic profile info
    // In a real app, you might store additional profile data in your database
    const profile = {
      id: userId,
      email: `user-${userId}@temp.com`, // Placeholder
      name: `User ${userId.slice(-4)}`, // Placeholder
      phone: '',
      dateOfBirth: '',
      preferences: {
        newsletter: true,
        smsUpdates: false,
        emailUpdates: true
      },
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        memberSince: new Date().toISOString()
      }
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, phone, dateOfBirth, preferences } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // In a real app, you would update the user profile in your database
    // For now, we'll just return the updated data
    const updatedProfile = {
      id: userId,
      name: name || `User ${userId.slice(-4)}`,
      phone: phone || '',
      dateOfBirth: dateOfBirth || '',
      preferences: preferences || {
        newsletter: true,
        smsUpdates: false,
        emailUpdates: true
      }
    }

    return NextResponse.json({ 
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}