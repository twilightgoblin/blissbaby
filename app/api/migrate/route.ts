import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

// This endpoint should be called once after deployment to run migrations
// Remove this file after running migrations for security
export async function POST() {
  try {
    // Only allow in development or with a secret key
    const secret = process.env.MIGRATION_SECRET || 'dev-secret'
    const providedSecret = process.env.NODE_ENV === 'development' ? 'dev-secret' : process.env.MIGRATION_SECRET
    
    if (!providedSecret) {
      return NextResponse.json({ error: 'Migration secret not configured' }, { status: 403 })
    }
    
    console.log('Running database migrations...')
    
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
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 })
  }
}