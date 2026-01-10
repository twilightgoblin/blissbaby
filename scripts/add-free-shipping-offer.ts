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

async function addFreeShippingOffer() {
  try {
    console.log('🚚 Adding Free Shipping offer...')

    const offer = await prisma.offers.create({
      data: {
        title: "Free Shipping on All Orders",
        description: "Get free shipping on all orders above ₹1000. No code needed!",
        type: "BANNER",
        discountType: "FREE_SHIPPING",
        discountValue: 0,
        minOrderAmount: 1000,
        startDate: new Date(),
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        buttonText: "Shop Now",
        buttonLink: "/products",
        priority: 8,
        isActive: true
      }
    })

    console.log(`✅ Created free shipping offer: ${offer.title}`)

    // Display summary
    const totalOffers = await prisma.offers.count()
    console.log(`📊 Total offers: ${totalOffers}`)

  } catch (error: any) {
    console.error('❌ Error creating free shipping offer:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
addFreeShippingOffer()