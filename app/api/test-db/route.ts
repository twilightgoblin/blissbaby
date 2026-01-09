import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test basic database connection
    const result = await db.$queryRaw`SELECT 1 as test`
    
    // Test categories table
    const categoryCount = await db.category.count()
    
    // Test products table  
    const productCount = await db.product.count()
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      testQuery: result,
      counts: {
        categories: categoryCount,
        products: productCount
      },
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('Running migrations via test-db endpoint...')
    
    // Import execSync here to avoid build issues
    const { execSync } = await import('child_process')
    
    // Run migrations
    const output = execSync('npx prisma migrate deploy', { 
      encoding: 'utf8',
      env: { ...process.env }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Migrations completed successfully',
      output: output
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}