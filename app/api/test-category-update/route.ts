import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, testData } = body
    
    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId is required' }, { status: 400 })
    }
    
    console.log('Testing category update for ID:', categoryId)
    console.log('Test data:', testData)
    
    // First, check if category exists
    const existingCategory = await db.categories.findUnique({
      where: { id: categoryId }
    })
    
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    console.log('Existing category:', existingCategory)
    
    // Perform the update
    const updateData = {
      name: testData?.name || existingCategory.name,
      description: testData?.description || existingCategory.description,
      updatedAt: new Date()
    }
    
    console.log('Update data:', updateData)
    
    const updatedCategory = await db.categories.update({
      where: { id: categoryId },
      data: updateData
    })
    
    console.log('Updated category:', updatedCategory)
    
    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        before: existingCategory,
        after: updatedCategory
      }
    })
  } catch (error: any) {
    console.error('Category update test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        meta: error.meta
      } : undefined
    }, { status: 500 })
  }
}