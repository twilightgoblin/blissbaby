import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  try {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found'
      }, { status: 500 })
    }
    
    // Test raw connection without Prisma
    const pool = new Pool({
      connectionString,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    })
    
    const client = await pool.connect()
    const result = await client.query('SELECT NOW() as current_time')
    client.release()
    await pool.end()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      currentTime: result.rows[0].current_time,
      connectionString: connectionString.replace(/:[^:@]*@/, ':***@') // Hide password
    })
    
  } catch (error) {
    console.error('Database connection error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
      connectionString: process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')
    }, { status: 500 })
  }
}