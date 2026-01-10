import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { OfferType, DiscountType } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    // In development, allow access without authentication for testing
    const { userId } = await auth()
    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'DISCOUNT_CODE', 'BANNER', or 'BOTH'
    const active = searchParams.get("active") // 'true' or 'false'

    const where: any = {}
    
    if (type) {
      where.type = type as OfferType
    }
    
    if (active !== null) {
      where.isActive = active === "true"
    }

    try {
      const offers = await db.offers.findMany({
        where,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" }
        ]
      })

      return NextResponse.json({ offers })
    } catch (prismaError) {
      console.log('Prisma failed, using fallback for offers:', prismaError)
      
      // Check if offers table exists, if not return empty array
      try {
        const { Pool } = await import('pg')
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          max: 1,
          ssl: { rejectUnauthorized: false }
        })
        
        const client = await pool.connect()
        const result = await client.query('SELECT COUNT(*) FROM offers').catch(() => null)
        client.release()
        await pool.end()
        
        if (!result) {
          // Table doesn't exist, return empty
          return NextResponse.json({ offers: [] })
        }
        
        // Table exists but Prisma failed, return empty for now
        return NextResponse.json({ offers: [] })
      } catch {
        return NextResponse.json({ offers: [] })
      }
    }
  } catch (error) {
    console.error("Error fetching offers:", error)
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // In development, allow access without authentication for testing
    const { userId } = await auth()
    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      code,
      type,
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      startDate,
      endDate,
      image,
      buttonText,
      buttonLink,
      priority,
      isActive
    } = body

    // Validate required fields
    if (!title || !type || !discountType || !discountValue || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate discount code uniqueness if provided
    if (code) {
      const existingOffer = await db.offers.findUnique({
        where: { code }
      })
      if (existingOffer) {
        return NextResponse.json(
          { error: "Discount code already exists" },
          { status: 400 }
        )
      }
    }

    const offer = await db.offers.create({
      data: {
        title,
        description,
        code,
        type: type as OfferType,
        discountType: discountType as DiscountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        image,
        buttonText,
        buttonLink,
        position: 'home-hero', // Fixed to home page only
        priority: priority ? parseInt(priority) : 0,
        isActive: isActive !== false
      }
    })

    return NextResponse.json({ offer }, { status: 201 })
  } catch (error) {
    console.error("Error creating offer:", error)
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 })
  }
}