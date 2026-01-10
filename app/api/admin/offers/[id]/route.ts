import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { OfferType, DiscountType } from "@prisma/client"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In development, allow access without authentication for testing
    const { userId } = await auth()
    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params in Next.js 15+
    const { id } = await params

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

    // Check if offer exists
    const existingOffer = await db.offers.findUnique({
      where: { id }
    })

    if (!existingOffer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    // Validate discount code uniqueness if changed
    if (code && code !== existingOffer.code) {
      const codeExists = await db.offers.findUnique({
        where: { code }
      })
      if (codeExists) {
        return NextResponse.json(
          { error: "Discount code already exists" },
          { status: 400 }
        )
      }
    }

    const offer = await db.offers.update({
      where: { id },
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

    return NextResponse.json({ offer })
  } catch (error) {
    console.error("Error updating offer:", error)
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In development, allow access without authentication for testing
    const { userId } = await auth()
    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params in Next.js 15+
    const { id } = await params
    
    console.log(`Attempting to delete offer with ID: ${id}`)

    if (!id) {
      console.log('No ID provided in request')
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 })
    }

    // Check if offer exists
    const existingOffer = await db.offers.findUnique({
      where: { id }
    })

    if (!existingOffer) {
      console.log(`Offer not found: ${id}`)
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    console.log(`Found offer to delete: ${existingOffer.title} (${existingOffer.type})`)

    await db.offers.delete({
      where: { id }
    })

    console.log(`Successfully deleted offer: ${id}`)
    return NextResponse.json({ message: "Offer deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting offer:", error)
    
    // Provide more specific error messages
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: "Offer not found or already deleted" }, { status: 404 })
    }
    
    if (error?.code === 'P2003') {
      return NextResponse.json({ error: "Cannot delete offer due to related records" }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: `Failed to delete offer: ${error?.message || 'Unknown database error'}` 
    }, { status: 500 })
  }
}