import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/categories'

// GET /api/categories - Get all active categories (public endpoint)
export async function GET() {
  try {
    const allCategories = await getCategories()
    
    // Filter only active categories for public use
    const activeCategories = allCategories.filter(category => category.isActive)
    
    return NextResponse.json({ categories: activeCategories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}