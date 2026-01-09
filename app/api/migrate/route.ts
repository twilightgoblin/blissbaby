import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

// This endpoint should be called once after deployment to run migrations
export async function POST(request: Request) {
  try {
    // Simple protection - only allow in development or with correct header
    const authHeader = request.headers.get('authorization')
    
    if (process.env.NODE_ENV === 'production' && authHeader !== 'Bearer migrate-now') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Running database migrations...')
    
    // Test connection first
    execSync('npx prisma db pull --force', { 
      stdio: 'pipe',
      env: { ...process.env }
    })
    
    // Run migrations
    execSync('npx prisma migrate deploy', { 
      stdio: 'pipe',
      env: { ...process.env }
    })
    
    console.log('Migrations completed successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migrations applied successfully' 
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

export async function GET() {
  return NextResponse.json({ 
    message: 'Migration endpoint ready. Use POST with Authorization: Bearer migrate-now' 
  })
}