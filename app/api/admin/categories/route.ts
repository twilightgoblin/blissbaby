import { NextRequest, NextResponse } from 'next/server'
import { getCategories, createCategory } from '@/lib/categories'

// GET /api/admin/categories - Get all categories
export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, icon, image, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const category = await createCategory({ name, description, icon, image, color })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}