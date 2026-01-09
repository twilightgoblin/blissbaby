import { NextRequest, NextResponse } from 'next/server'
import { getCategoryById, updateCategory, deleteCategory } from '@/lib/categories'

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
    const { id } = await params
    const body = await request.json()
    const { name, description, icon, image, color, isActive } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Valid category ID is required' },
        { status: 400 }
      )
    }

    console.log(`Updating category ${id} with data:`, { name, description, icon, image, color, isActive })

    const category = await updateCategory(id, {
      name: name.trim(),
      description: description?.trim() || null,
      icon: icon?.trim() || null,
      image: image?.trim() || null,
      color: color || 'bg-blue-100',
      isActive: isActive !== undefined ? Boolean(isActive) : undefined
    })

    console.log(`Successfully updated category ${id}:`, category)
    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Error updating category:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    })
    
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