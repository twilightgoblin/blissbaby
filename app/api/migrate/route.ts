import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ 
      message: 'Migration endpoint is working',
      timestamp: new Date().toISOString(),
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'GET failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/migrate called')
    
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader)
    
    if (process.env.NODE_ENV === 'production' && authHeader !== 'Bearer migrate-now') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Just return basic info for now
    return NextResponse.json({ 
      success: true, 
      message: 'POST endpoint working',
      timestamp: new Date().toISOString(),
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
    
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'POST failed'
    }, { status: 500 })
  }
}