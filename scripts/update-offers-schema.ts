import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Create Prisma client
const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({
    adapter,
    log: ['error'],
    errorFormat: 'pretty',
  })
}

const prisma = createPrismaClient()

async function updateOffersSchema() {
  try {
    console.log('🔄 Updating offers schema...')

    // Check if offers table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'offers'
      );
    `

    console.log('📋 Offers table exists:', tableExists)

    // Add FREE_SHIPPING to DiscountType enum if not exists
    try {
      await prisma.$executeRaw`
        ALTER TYPE "DiscountType" ADD VALUE IF NOT EXISTS 'FREE_SHIPPING';
      `
      console.log('✅ Added FREE_SHIPPING to DiscountType enum')
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  FREE_SHIPPING already exists in DiscountType enum')
      } else {
        console.error('❌ Error adding FREE_SHIPPING to enum:', error.message)
      }
    }

    // Check current offers count
    const offersCount = await prisma.offers.count()
    console.log(`📊 Current offers count: ${offersCount}`)

    if (offersCount === 0) {
      console.log('🌱 Creating sample offers...')
      
      // Create sample offers
      const sampleOffers = [
        {
          title: "Baby Care Essentials",
          description: "Save big on baby care products including diapers, wipes, and lotions.",
          code: "BABYCARE500",
          type: "BOTH" as const,
          discountType: "FIXED_AMOUNT" as const,
          discountValue: 500,
          minOrderAmount: 2000,
          maxUses: 100,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800",
          buttonText: "Shop Baby Care",
          buttonLink: "/products?category=baby-care",
          priority: 10,
          isActive: true
        },
        {
          title: "Free Shipping on All Orders",
          description: "Get free shipping on all orders above ₹1000. No code needed!",
          type: "BANNER" as const,
          discountType: "FREE_SHIPPING" as const,
          discountValue: 0,
          minOrderAmount: 1000,
          startDate: new Date(),
          image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
          buttonText: "Shop Now",
          buttonLink: "/products",
          priority: 8,
          isActive: true
        },
        {
          title: "New Parent Special",
          description: "20% off on your first order. Perfect for new parents!",
          code: "NEWPARENT20",
          type: "BOTH" as const,
          discountType: "PERCENTAGE" as const,
          discountValue: 20,
          minOrderAmount: 1500,
          maxUses: 50,
          startDate: new Date(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
          buttonText: "Get 20% Off",
          buttonLink: "/products",
          priority: 9,
          isActive: true
        }
      ]

      for (const offerData of sampleOffers) {
        try {
          const offer = await prisma.offers.create({
            data: offerData
          })
          console.log(`✅ Created offer: ${offer.title}`)
        } catch (error: any) {
          console.error(`❌ Error creating offer "${offerData.title}":`, error.message)
        }
      }
    }

    // Display final summary
    const finalCount = await prisma.offers.count()
    const activeOffers = await prisma.offers.count({ where: { isActive: true } })
    
    console.log('\n📊 Offers Summary:')
    console.log(`📋 Total offers: ${finalCount}`)
    console.log(`✅ Active offers: ${activeOffers}`)

    console.log('\n🎉 Offers schema update completed!')

  } catch (error) {
    console.error('❌ Error updating offers schema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
updateOffersSchema()