import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { OfferType, DiscountType } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
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

    const offers = await db.offer.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json({ offers })
  } catch (error) {
    console.error("Error fetching offers:", error)
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
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
      maxDiscountAmount,
      usageLimit,
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
      const existingOffer = await db.offer.findUnique({
        where: { code }
      })
      if (existingOffer) {
        return NextResponse.json(
          { error: "Discount code already exists" },
          { status: 400 }
        )
      }
    }

    const offer = await db.offer.create({
      data: {
        title,
        description,
        code,
        type: type as OfferType,
        discountType: discountType as DiscountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
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