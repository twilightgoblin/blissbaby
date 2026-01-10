import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'BANNER' or 'BOTH'

    const now = new Date()
    
    const where: any = {
      isActive: true,
      startDate: { lte: now },
      position: 'home-hero', // Only home page offers
      OR: [
        { endDate: null },
        { endDate: { gte: now } }
      ]
    }
    
    // Only support BANNER and BOTH types now
    if (type === 'BANNER') {
      where.type = { in: ['BANNER', 'BOTH'] }
    } else if (type) {
      where.type = type
    }

    const offers = await db.offers.findMany({
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