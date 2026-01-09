import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const result = await db.$queryRaw`SELECT 1 as test`
    console.log('Basic query result:', result)
    
    // Test categories table
    const categoryCount = await db.categories.count()
    console.log('Category count:', categoryCount)
    
    // Test a simple category fetch
    const categories = await db.categories.findMany({
      take: 1,
      select: { id: true, name: true }
    })
    console.log('Sample category:', categories[0])
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        categoryCount,
        sampleCategory: categories[0] || null
      }
    })
  } catch (error: any) {
    console.error('Database test failed:', error)
    
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