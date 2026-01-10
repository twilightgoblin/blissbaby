import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { ProductStatus } from '@prisma/client'

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

// Additional products to add variety
const additionalProducts = [
  // More Baby Clothing
  {
    name: "Newborn Starter Pack",
    description: "Complete clothing set for newborns including 5 onesies, 3 sleepers, and 2 hats.",
    price: 2499,
    comparePrice: 3499,
    brand: "FirstSteps",
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500"
    ],
    inventory: 25,
    sku: "FS-NSP-021",
    featured: true,
    tags: ["newborn", "starter pack", "complete set"],
    categoryName: "Baby Clothing"
  },
  {
    name: "Winter Baby Jacket",
    description: "Warm and cozy jacket for cold weather. Water-resistant with soft fleece lining.",
    price: 1899,
    brand: "WarmTots",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
    ],
    inventory: 20,
    sku: "WT-WJ-022",
    featured: false,
    tags: ["winter", "jacket", "warm", "water-resistant"],
    categoryName: "Baby Clothing"
  },

  // More Feeding & Nursing
  {
    name: "Breast Pump Starter Kit",
    description: "Electric breast pump with storage bags and sterilizer. Perfect for nursing mothers.",
    price: 8999,
    comparePrice: 12999,
    brand: "MomCare",
    images: [
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500"
    ],
    inventory: 15,
    sku: "MC-BP-023",
    featured: true,
    tags: ["breast pump", "nursing", "electric", "sterilizer"],
    categoryName: "Feeding & Nursing"
  },
  {
    name: "Baby Food Maker",
    description: "Steam and blend baby food in one device. Makes fresh, healthy meals for your baby.",
    price: 5999,
    brand: "FreshStart",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
    ],
    inventory: 18,
    sku: "FS-BFM-024",
    featured: false,
    tags: ["baby food", "steamer", "blender", "healthy"],
    categoryName: "Feeding & Nursing"
  },

  // More Toys & Games
  {
    name: "Wooden Building Blocks Set",
    description: "Natural wooden blocks in various shapes and colors. Develops creativity and motor skills.",
    price: 2299,
    brand: "EcoPlay",
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500"
    ],
    inventory: 30,
    sku: "EP-WB-025",
    featured: false,
    tags: ["wooden blocks", "natural", "creativity", "motor skills"],
    categoryName: "Toys & Games"
  },
  {
    name: "Interactive Learning Robot",
    description: "Smart robot that teaches letters, numbers, and songs. Voice recognition and LED lights.",
    price: 4999,
    comparePrice: 6999,
    brand: "TechTots",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"
    ],
    inventory: 12,
    sku: "TT-LR-026",
    featured: true,
    tags: ["robot", "interactive", "learning", "voice recognition"],
    categoryName: "Toys & Games"
  },

  // More Baby Care
  {
    name: "Baby Monitor with Camera",
    description: "HD video baby monitor with night vision, two-way audio, and smartphone app.",
    price: 7999,
    comparePrice: 10999,
    brand: "SafeWatch",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"
    ],
    inventory: 20,
    sku: "SW-BM-027",
    featured: true,
    tags: ["baby monitor", "HD video", "night vision", "smartphone app"],
    categoryName: "Baby Care"
  },
  {
    name: "Diaper Disposal System",
    description: "Odor-locking diaper pail with easy-to-use refill system. Keeps nursery fresh.",
    price: 3499,
    brand: "FreshNursery",
    images: [
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500"
    ],
    inventory: 25,
    sku: "FN-DD-028",
    featured: false,
    tags: ["diaper pail", "odor-locking", "refill system", "fresh"],
    categoryName: "Baby Care"
  },

  // More Nursery & Furniture
  {
    name: "Rocking Chair for Nursery",
    description: "Comfortable rocking chair perfect for feeding and soothing baby. Soft cushions included.",
    price: 14999,
    brand: "ComfortRock",
    images: [
      "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=500"
    ],
    inventory: 8,
    sku: "CR-RC-029",
    featured: false,
    tags: ["rocking chair", "nursery", "comfortable", "feeding"],
    categoryName: "Nursery & Furniture"
  },
  {
    name: "Baby Wardrobe with Drawers",
    description: "Spacious wardrobe with hanging space and drawers. Grows with your child.",
    price: 18999,
    comparePrice: 24999,
    brand: "GrowSpace",
    images: [
      "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=500"
    ],
    inventory: 6,
    sku: "GS-BW-030",
    featured: true,
    tags: ["wardrobe", "drawers", "spacious", "grows with child"],
    categoryName: "Nursery & Furniture"
  }
]

async function addMoreProducts() {
  try {
    console.log('🌱 Adding more products to the database...')

    // Get existing categories
    const categories = await prisma.categories.findMany()
    console.log(`📁 Found ${categories.length} categories`)

    let addedCount = 0

    for (const productData of additionalProducts) {
      try {
        // Find the category for this product
        const category = categories.find(cat => cat.name === productData.categoryName)
        if (!category) {
          console.log(`⚠️  Category "${productData.categoryName}" not found for product "${productData.name}", skipping...`)
          continue
        }

        // Check if product with this SKU already exists
        const existingProduct = await prisma.products.findUnique({
          where: { sku: productData.sku }
        })

        if (existingProduct) {
          console.log(`⚠️  Product with SKU "${productData.sku}" already exists, skipping...`)
          continue
        }

        const { categoryName, ...productCreateData } = productData
        
        const product = await prisma.products.create({
          data: {
            ...productCreateData,
            categoryId: category.id,
            status: ProductStatus.ACTIVE,
            lowStock: 5,
            weight: Math.random() * 2 + 0.1, // Random weight between 0.1-2.1 kg
            seoTitle: `${productData.name} - BabyBliss`,
            seoDescription: productData.description?.substring(0, 160) || `Buy ${productData.name} at BabyBliss`
          }
        })
        
        addedCount++
        console.log(`✅ Added product: ${product.name} (${product.sku})`)
      } catch (error: any) {
        console.error(`❌ Error adding product "${productData.name}":`, error.message)
      }
    }

    console.log(`\n🎉 Successfully added ${addedCount} new products!`)
    
    // Display updated summary
    const totalProducts = await prisma.products.count()
    console.log(`📊 Total products in database: ${totalProducts}`)

  } catch (error) {
    console.error('❌ Error adding products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
addMoreProducts()