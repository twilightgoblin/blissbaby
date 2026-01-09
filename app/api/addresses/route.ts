import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    try {
      const addresses = await db.addresses.findMany({
        where: { clerkUserId: userId },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ addresses })
    } catch (prismaError) {
      console.log('Prisma failed, using raw SQL fallback for addresses:', prismaError)
      
      // Fallback with raw SQL
      const { Pool } = await import('pg')
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        ssl: { rejectUnauthorized: false }
      })
      
      const client = await pool.connect()
      
      const result = await client.query(`
        SELECT * FROM addresses WHERE "clerkUserId" = $1 ORDER BY "createdAt" DESC
      `, [userId])
      
      client.release()
      await pool.end()
      
      return NextResponse.json({ addresses: result.rows })
    }
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      type = 'SHIPPING',
      firstName,
      lastName,
      company,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country = 'IN',
      phone,
      isDefault = false
    } = body

    if (!userId || !firstName || !lastName || !addressLine1 || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    try {
      const address = await db.addresses.create({
        data: {
          clerkUserId: userId,
          userEmail: `user-${userId}@temp.com`,
          userName: `${firstName} ${lastName}`,
          type,
          firstName,
          lastName,
          company: company || '',
          addressLine1,
          addressLine2: addressLine2 || '',
          city,
          state,
          postalCode,
          country,
          phone: phone || '',
          isDefault
        }
      })

      return NextResponse.json({ address }, { status: 201 })
    } catch (prismaError) {
      console.log('Prisma failed, using raw SQL fallback for address creation:', prismaError)
      
      // Fallback with raw SQL
      const { Pool } = await import('pg')
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        ssl: { rejectUnauthorized: false }
      })
      
      const client = await pool.connect()
      
      const addressId = crypto.randomUUID()
      const result = await client.query(`
        INSERT INTO addresses (
          id, "clerkUserId", "userEmail", "userName", type, "firstName", "lastName", 
          company, "addressLine1", "addressLine2", city, state, "postalCode", 
          country, phone, "isDefault", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
        ) RETURNING *
      `, [
        addressId, userId, `user-${userId}@temp.com`, `${firstName} ${lastName}`,
        type, firstName, lastName, company || '', addressLine1, addressLine2 || '',
        city, state, postalCode, country, phone || '', isDefault
      ])
      
      client.release()
      await pool.end()
      
      return NextResponse.json({ address: result.rows[0] }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
}