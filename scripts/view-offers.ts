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

async function viewOffers() {
  try {
    console.log('🎯 BabyBliss Offers & Banners Overview\n')

    const offers = await prisma.offers.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    if (offers.length === 0) {
      console.log('📭 No offers found in the database.')
      return
    }

    console.log('🎪 CURRENT OFFERS:')
    console.log('─'.repeat(80))

    offers.forEach((offer, index) => {
      const now = new Date()
      let status = '❓ Unknown'
      
      if (!offer.isActive) {
        status = '❌ Inactive'
      } else if (offer.startDate > now) {
        status = '⏰ Scheduled'
      } else if (offer.endDate && offer.endDate < now) {
        status = '⏳ Expired'
      } else {
        status = '✅ Active'
      }

      console.log(`\n${index + 1}. ${offer.title}`)
      console.log(`   🏷️  Type: ${offer.type}`)
      console.log(`   💰 Discount: ${offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}%` : 
                                     offer.discountType === 'FIXED_AMOUNT' ? `₹${offer.discountValue}` : 
                                     'Free Shipping'}`)
      console.log(`   📅 Period: ${offer.startDate.toLocaleDateString()} - ${offer.endDate?.toLocaleDateString() || 'No end date'}`)
      console.log(`   📊 Status: ${status}`)
      console.log(`   🎯 Priority: ${offer.priority}`)
      console.log(`   📝 Code: ${offer.code || 'No code'}`)
      console.log(`   💳 Min Order: ${offer.minOrderAmount ? `₹${offer.minOrderAmount}` : 'No minimum'}`)
      console.log(`   🔢 Usage: ${offer.usedCount}${offer.maxUses ? `/${offer.maxUses}` : ''}`)
      console.log(`   🖼️  Image: ${offer.image ? 'Yes' : 'No'}`)
      console.log(`   🔗 Button: "${offer.buttonText}" → ${offer.buttonLink}`)
      if (offer.description) {
        console.log(`   📄 Description: ${offer.description}`)
      }
    })

    // Summary statistics
    const now = new Date()
    const stats = {
      total: offers.length,
      active: offers.filter(o => 
        o.isActive && 
        o.startDate <= now && 
        (!o.endDate || o.endDate >= now)
      ).length,
      scheduled: offers.filter(o => 
        o.isActive && o.startDate > now
      ).length,
      expired: offers.filter(o => 
        o.endDate && o.endDate < now
      ).length,
      inactive: offers.filter(o => !o.isActive).length,
      bannerOnly: offers.filter(o => o.type === 'BANNER').length,
      codeOnly: offers.filter(o => o.type === 'DISCOUNT_CODE').length,
      both: offers.filter(o => o.type === 'BOTH').length,
      totalUsage: offers.reduce((sum, o) => sum + o.usedCount, 0)
    }

    console.log('\n📈 SUMMARY STATISTICS:')
    console.log('─'.repeat(80))
    console.log(`📊 Total Offers: ${stats.total}`)
    console.log(`✅ Active: ${stats.active}`)
    console.log(`⏰ Scheduled: ${stats.scheduled}`)
    console.log(`⏳ Expired: ${stats.expired}`)
    console.log(`❌ Inactive: ${stats.inactive}`)
    console.log('')
    console.log(`🎪 Banner Only: ${stats.bannerOnly}`)
    console.log(`🏷️  Code Only: ${stats.codeOnly}`)
    console.log(`🎯 Banner + Code: ${stats.both}`)
    console.log('')
    console.log(`📊 Total Usage: ${stats.totalUsage}`)

  } catch (error) {
    console.error('❌ Error viewing offers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
viewOffers()