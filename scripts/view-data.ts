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

async function viewData() {
  try {
    console.log('📊 BabyBliss Database Overview\n')

    // Get categories with product counts
    const categories = await prisma.categories.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    console.log('📁 CATEGORIES:')
    console.log('─'.repeat(60))
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} ${category.icon || ''}`)
      console.log(`   📦 Products: ${category._count.products}`)
      console.log(`   🎨 Color: ${category.color}`)
      console.log(`   📝 Description: ${category.description || 'No description'}`)
      console.log(`   ✅ Active: ${category.isActive ? 'Yes' : 'No'}`)
      console.log('')
    })

    // Get some sample products from each category
    console.log('\n🛍️  SAMPLE PRODUCTS BY CATEGORY:')
    console.log('─'.repeat(60))

    for (const category of categories) {
      if (category._count.products > 0) {
        console.log(`\n📂 ${category.name.toUpperCase()}:`)
        
        const products = await prisma.products.findMany({
          where: { categoryId: category.id },
          take: 3,
          orderBy: { featured: 'desc' }
        })

        products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name}`)
          console.log(`     💰 Price: ₹${product.price}${product.comparePrice ? ` (was ₹${product.comparePrice})` : ''}`)
          console.log(`     📦 Stock: ${product.inventory}`)
          console.log(`     🏷️  SKU: ${product.sku}`)
          console.log(`     ⭐ Featured: ${product.featured ? 'Yes' : 'No'}`)
          console.log(`     🏢 Brand: ${product.brand || 'N/A'}`)
          console.log('')
        })
      }
    }

    // Summary statistics
    const totalProducts = await prisma.products.count()
    const activeProducts = await prisma.products.count({ where: { status: 'ACTIVE' } })
    const featuredProducts = await prisma.products.count({ where: { featured: true } })
    
    console.log('\n📈 SUMMARY STATISTICS:')
    console.log('─'.repeat(60))
    console.log(`📁 Total Categories: ${categories.length}`)
    console.log(`📦 Total Products: ${totalProducts}`)
    console.log(`✅ Active Products: ${activeProducts}`)
    console.log(`⭐ Featured Products: ${featuredProducts}`)
    console.log(`🏪 Active Categories: ${categories.filter(c => c.isActive).length}`)

  } catch (error) {
    console.error('❌ Error viewing data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
viewData()