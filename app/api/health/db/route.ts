import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db-health'

export async function GET() {
  try {
    const health = await checkDatabaseHealth()
    
    if (health.healthy) {
      return NextResponse.json(health, { status: 200 })
    } else {
      return NextResponse.json(health, { status: 503 })
    }
  } catch (error: any) {
    return NextResponse.json(
      { 
        healthy: false, 
        message: error.message || 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}