import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find all DISCOUNT_CODE offers
    const discountCodeOffers = await db.offers.findMany({
      where: { type: 'DISCOUNT_CODE' }
    })
    
    console.log(`Found ${discountCodeOffers.length} DISCOUNT_CODE offers to migrate`)
    
    const migratedOffers = []
    
    for (const offer of discountCodeOffers) {
      console.log(`Migrating offer: ${offer.title} (${offer.id})`)
      
      // Convert to BOTH type and add default banner fields if missing
      const updatedOffer = await db.offers.update({
        where: { id: offer.id },
        data: {
          type: 'BOTH',
          // Add default banner fields if they don't exist
          image: offer.image || '',
          buttonText: offer.buttonText || 'Shop Now',
          buttonLink: offer.buttonLink || '/products',
          position: offer.position || 'home-hero'
        }
      })
      
      migratedOffers.push(updatedOffer)
      console.log(`✓ Migrated ${offer.title} from DISCOUNT_CODE to BOTH`)
    }
    
    return NextResponse.json({ 
      message: `Successfully migrated ${migratedOffers.length} offers from DISCOUNT_CODE to BOTH`,
      migratedOffers 
    })
    
  } catch (error) {
    console.error("Error migrating offers:", error)
    return NextResponse.json({ error: "Failed to migrate offers" }, { status: 500 })
  }
}