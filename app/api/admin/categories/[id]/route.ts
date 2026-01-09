import { NextRequest, NextResponse } from 'next/server'
import { getCategoryById, updateCategory, deleteCategory } from '@/lib/categories'
import { db } from '@/lib/db'

// GET /api/admin/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await getCategoryById(id)

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== Category Update Request Started ===')
    
    const { id } = await params
    console.log('Category ID:', id)
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { name, description, icon, image, color, isActive } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      console.log('Validation failed: Invalid name')
      return NextResponse.json(
        { error: 'Category name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Validate ID format
    if (!id || typeof id !== 'string') {
      console.log('Validation failed: Invalid ID')
      return NextResponse.json(
        { error: 'Valid category ID is required' },
        { status: 400 }
      )
    }

    console.log('Validation passed, attempting database update...')

    // Direct database update without health check to avoid additional complexity
    const updateData: any = {
      name: name.trim(),
      updatedAt: new Date()
    }

    // Only include fields that are provided
    if (description !== undefined) updateData.description = description?.trim() || null
    if (icon !== undefined) updateData.icon = icon?.trim() || null
    if (image !== undefined) updateData.image = image?.trim() || null
    if (color !== undefined) updateData.color = color || 'bg-blue-100'
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    console.log('Update data prepared:', updateData)

    const category = await db.categories.update({
      where: { id },
      data: updateData
    })

    console.log('Database update successful:', category.id)
    console.log('=== Category Update Request Completed ===')
    
    return NextResponse.json(category)
  } catch (error: any) {
    console.error('=== Category Update Error ===')
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error stack:', error.stack)
    console.error('Error meta:', error.meta)
    console.error('================================')
    
    // Handle specific Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      )
    }

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Database connection errors
    if (error?.code === 'P1001' || error?.code === 'P1008' || error?.code === 'P1017') {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again.' },
        { status: 503 }
      )
    }

    // Generic database errors
    if (error?.code?.startsWith('P')) {
      return NextResponse.json(
        { 
          error: 'Database error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: error.code
        },
        { status: 500 }
      )
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Failed to update category',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteCategory(id)
    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    
    if (error?.message === 'Category not found') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    if (error?.message?.includes('Cannot delete category with products')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}