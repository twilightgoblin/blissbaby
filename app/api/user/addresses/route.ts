import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Try to get user ID from Clerk, but don't fail if not available
    let userId = null
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (authError) {
      console.log('Auth not available for addresses API')
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user addresses using Clerk user ID
    const addresses = await db.address.findMany({
      where: { clerkUserId: userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ addresses });

  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}