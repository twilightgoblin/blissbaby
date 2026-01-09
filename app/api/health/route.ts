import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ProductStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const productCount = await db.products.count({
      where: { status: ProductStatus.ACTIVE }
    })
    
    // Test a simple product query
    const sampleProduct = await db.products.findFirst({
      where: { status: ProductStatus.ACTIVE },
      select: { id: true, name: true, status: true }
    })
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      activeProducts: productCount,
      sampleProduct: sampleProduct ? {
        id: sampleProduct.id,
        name: sampleProduct.name,
        status: sampleProduct.status
      } : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}