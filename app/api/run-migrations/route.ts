import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Import execSync dynamically to avoid build issues
    const { execSync } = await import('child_process')
    
    console.log('Starting migration process...')
    
    // Run migrations
    const output = execSync('npx prisma migrate deploy', {
      encoding: 'utf8',
      env: { ...process.env },
      timeout: 60000 // 60 second timeout
    })
    
    console.log('Migration output:', output)
    
    return NextResponse.json({
      success: true,
      message: 'Migrations completed successfully',
      output: output.toString()
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed',
      details: error instanceof Error && 'stdout' in error ? error.stdout : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to run database migrations'
  })
}