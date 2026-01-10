import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { ProductStatus } from '@prisma/client'

// Create Prisma client with proper configuration
const createPrismaClient = () => {
  try {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    })
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    throw error
  }
}

const prisma = createPrismaClient()

// Sample categories for baby products
const categories = [
  {
    name: "Baby Clothing",
    description: "Comfortable and adorable clothing for babies and toddlers",
    icon: "👕",
    color: "bg-pink-100",
    sortOrder: 1
  },
  {
    name: "Feeding & Nursing",
    description: "Bottles, bibs, high chairs and feeding essentials",
    icon: "🍼",
    color: "bg-blue-100",
    sortOrder: 2
  },
  {
    name: "Toys & Games",
    description: "Educational and fun toys for development",
    icon: "🧸",
    color: "bg-yellow-100",
    sortOrder: 3
  },
  {
    name: "Baby Care",
    description: "Diapers, wipes, lotions and hygiene products",
    icon: "🧴",
    color: "bg-green-100",
    sortOrder: 4
  },
  {
    name: "Nursery & Furniture",
    description: "Cribs, changing tables, and nursery decor",
    icon: "🛏️",
    color: "bg-purple-100",
    sortOrder: 5
  },
  {
    name: "Strollers & Car Seats",
    description: "Safe transportation for your little one",
    icon: "🚗",
    color: "bg-orange-100",
    sortOrder: 6
  },
  {
    name: "Bath & Potty",
    description: "Bath time essentials and potty training supplies",
    icon: "🛁",
    color: "bg-cyan-100",
    sortOrder: 7
  },
  {
    name: "Books & Learning",
    description: "Educational books and learning materials",
    icon: "📚",
    color: "bg-indigo-100",
    sortOrder: 8
  }
]

// Sample products for each category
const products = [
  // Baby Clothing
  {
    name: "Organic Cotton Onesie Set",
    description: "Soft, breathable organic cotton onesies in various colors. Perfect for sensitive baby skin.",
    price: 899,
    comparePrice: 1299,
    brand: "BabyBliss",
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500"
    ],
    inventory: 50,
    sku: "BB-ONS-001",
    featured: true,
    tags: ["organic", "cotton", "onesie", "newborn"],
    categoryName: "Baby Clothing"
  },
  {
    name: "Cute Animal Print Romper",
    description: "Adorable romper with fun animal prints. Easy snap closures for quick diaper changes.",
    price: 1299,
    comparePrice: 1799,
    brand: "TinyTots",
    images: [
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=500"
    ],
    inventory: 30,
    sku: "TT-ROM-002",
    featured: false,
    tags: ["romper", "animal print", "snap closure"],
    categoryName: "Baby Clothing"
  },
  {
    name: "Cozy Sleep Pajama Set",
    description: "Ultra-soft pajama set for comfortable sleep. Includes top and bottom with elastic waistband.",
    price: 1599,
    brand: "SleepyBaby",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
    ],
    inventory: 25,
    sku: "SB-PJ-003",
    featured: false,
    tags: ["pajamas", "sleepwear", "comfort"],
    categoryName: "Baby Clothing"
  },

  // Feeding & Nursing
  {
    name: "Anti-Colic Baby Bottle Set",
    description: "BPA-free bottles with anti-colic system. Includes 3 bottles of different sizes.",
    price: 2499,
    comparePrice: 3299,
    brand: "FeedWell",
    images: [
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500"
    ],
    inventory: 40,
    sku: "FW-BOT-004",
    featured: true,
    tags: ["bottle", "anti-colic", "BPA-free", "feeding"],
    categoryName: "Feeding & Nursing"
  },
  {
    name: "Silicone Baby Bib Set",
    description: "Waterproof silicone bibs with food catcher. Easy to clean and dishwasher safe.",
    price: 799,
    brand: "CleanEats",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
    ],
    inventory: 60,
    sku: "CE-BIB-005",
    featured: false,
    tags: ["bib", "silicone", "waterproof", "easy clean"],
    categoryName: "Feeding & Nursing"
  },
  {
    name: "Adjustable High Chair",
    description: "Grows with your child. 5-point safety harness and removable tray for easy cleaning.",
    price: 8999,
    comparePrice: 12999,
    brand: "SafeSeat",
    images: [
      "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=500"
    ],
    inventory: 15,
    sku: "SS-HC-006",
    featured: true,
    tags: ["high chair", "adjustable", "safety harness"],
    categoryName: "Feeding & Nursing"
  },

  // Toys & Games
  {
    name: "Soft Plush Teddy Bear",
    description: "Cuddly teddy bear made from hypoallergenic materials. Perfect first friend for babies.",
    price: 1899,
    brand: "CuddleBuddy",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"
    ],
    inventory: 35,
    sku: "CB-TB-007",
    featured: true,
    tags: ["teddy bear", "plush", "hypoallergenic", "cuddly"],
    categoryName: "Toys & Games"
  },
  {
    name: "Colorful Stacking Rings",
    description: "Educational toy that helps develop hand-eye coordination and color recognition.",
    price: 1299,
    brand: "LearnPlay",
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500"
    ],
    inventory: 45,
    sku: "LP-SR-008",
    featured: false,
    tags: ["stacking rings", "educational", "coordination", "colors"],
    categoryName: "Toys & Games"
  },
  {
    name: "Musical Activity Gym",
    description: "Interactive play mat with hanging toys, lights, and music to stimulate baby's senses.",
    price: 4999,
    comparePrice: 6999,
    brand: "PlayTime",
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500"
    ],
    inventory: 20,
    sku: "PT-AG-009",
    featured: true,
    tags: ["activity gym", "musical", "play mat", "sensory"],
    categoryName: "Toys & Games"
  },

  // Baby Care
  {
    name: "Ultra-Soft Diapers Pack",
    description: "Premium diapers with 12-hour protection. Hypoallergenic and dermatologically tested.",
    price: 1599,
    brand: "DryBaby",
    images: [
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500"
    ],
    inventory: 100,
    sku: "DB-DIA-010",
    featured: false,
    tags: ["diapers", "hypoallergenic", "12-hour protection"],
    categoryName: "Baby Care"
  },
  {
    name: "Gentle Baby Wipes",
    description: "99% water wipes with natural ingredients. Perfect for sensitive skin.",
    price: 299,
    brand: "PureClean",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
    ],
    inventory: 80,
    sku: "PC-WIP-011",
    featured: false,
    tags: ["wipes", "99% water", "natural", "sensitive skin"],
    categoryName: "Baby Care"
  },
  {
    name: "Organic Baby Lotion",
    description: "Moisturizing lotion with organic ingredients. Keeps baby's skin soft and protected.",
    price: 899,
    brand: "NatureBaby",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"
    ],
    inventory: 40,
    sku: "NB-LOT-012",
    featured: true,
    tags: ["lotion", "organic", "moisturizing", "natural"],
    categoryName: "Baby Care"
  },

  // Nursery & Furniture
  {
    name: "Convertible Baby Crib",
    description: "Grows with your child - converts from crib to toddler bed. Solid wood construction.",
    price: 24999,
    comparePrice: 34999,
    brand: "DreamNest",
    images: [
      "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=500"
    ],
    inventory: 8,
    sku: "DN-CRB-013",
    featured: true,
    tags: ["crib", "convertible", "solid wood", "toddler bed"],
    categoryName: "Nursery & Furniture"
  },
  {
    name: "Changing Table with Storage",
    description: "Spacious changing table with multiple shelves for organizing baby essentials.",
    price: 12999,
    brand: "OrganizeIt",
    images: [
      "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=500"
    ],
    inventory: 12,
    sku: "OI-CT-014",
    featured: false,
    tags: ["changing table", "storage", "organization"],
    categoryName: "Nursery & Furniture"
  },

  // Strollers & Car Seats
  {
    name: "Lightweight Travel Stroller",
    description: "Compact, lightweight stroller perfect for travel. One-hand fold mechanism.",
    price: 15999,
    comparePrice: 21999,
    brand: "EasyGo",
    images: [
      "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=500"
    ],
    inventory: 18,
    sku: "EG-STR-015",
    featured: true,
    tags: ["stroller", "lightweight", "travel", "one-hand fold"],
    categoryName: "Strollers & Car Seats"
  },
  {
    name: "Infant Car Seat",
    description: "Safety-first car seat with 5-point harness. Meets all safety standards.",
    price: 18999,
    brand: "SafeRide",
    images: [
      "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=500"
    ],
    inventory: 15,
    sku: "SR-CS-016",
    featured: true,
    tags: ["car seat", "infant", "5-point harness", "safety"],
    categoryName: "Strollers & Car Seats"
  },

  // Bath & Potty
  {
    name: "Baby Bath Tub with Support",
    description: "Ergonomic baby bath tub with built-in support for newborns. Non-slip base.",
    price: 2999,
    brand: "SplashTime",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
    ],
    inventory: 25,
    sku: "ST-BT-017",
    featured: false,
    tags: ["bath tub", "ergonomic", "newborn support", "non-slip"],
    categoryName: "Bath & Potty"
  },
  {
    name: "Potty Training Seat",
    description: "Comfortable potty seat that fits on regular toilets. Includes step stool.",
    price: 1899,
    brand: "PottyPal",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
    ],
    inventory: 30,
    sku: "PP-PTS-018",
    featured: false,
    tags: ["potty training", "toilet seat", "step stool"],
    categoryName: "Bath & Potty"
  },

  // Books & Learning
  {
    name: "First Words Board Book Set",
    description: "Set of 6 board books introducing first words with colorful illustrations.",
    price: 1299,
    brand: "LearnEarly",
    images: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500"
    ],
    inventory: 50,
    sku: "LE-BB-019",
    featured: false,
    tags: ["board books", "first words", "illustrations", "learning"],
    categoryName: "Books & Learning"
  },
  {
    name: "Interactive Learning Tablet",
    description: "Educational tablet with songs, sounds, and learning activities for toddlers.",
    price: 3999,
    comparePrice: 5499,
    brand: "SmartTots",
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500"
    ],
    inventory: 22,
    sku: "ST-LT-020",
    featured: true,
    tags: ["learning tablet", "interactive", "educational", "toddler"],
    categoryName: "Books & Learning"
  }
]

async function seedData() {
  try {
    console.log('🌱 Starting to seed categories and products...')

    // Create categories first
    console.log('📁 Creating categories...')
    const createdCategories = []
    
    for (const categoryData of categories) {
      try {
        const category = await prisma.categories.create({
          data: categoryData
        })
        createdCategories.push(category)
        console.log(`✅ Created category: ${category.name}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Category "${categoryData.name}" already exists, skipping...`)
          // Get existing category
          const existing = await prisma.categories.findUnique({
            where: { name: categoryData.name }
          })
          if (existing) createdCategories.push(existing)
        } else {
          console.error(`❌ Error creating category "${categoryData.name}":`, error.message)
        }
      }
    }

    // Create products
    console.log('🛍️  Creating products...')
    let createdProductsCount = 0
    
    for (const productData of products) {
      try {
        // Find the category for this product
        const category = createdCategories.find(cat => cat.name === productData.categoryName)
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
        
        createdProductsCount++
        console.log(`✅ Created product: ${product.name} (${product.sku})`)
      } catch (error: any) {
        console.error(`❌ Error creating product "${productData.name}":`, error.message)
      }
    }

    console.log(`\n🎉 Seeding completed!`)
    console.log(`📁 Categories created: ${createdCategories.length}`)
    console.log(`🛍️  Products created: ${createdProductsCount}`)
    
    // Display summary
    const totalCategories = await prisma.categories.count()
    const totalProducts = await prisma.products.count()
    
    console.log(`\n📊 Database Summary:`)
    console.log(`📁 Total categories: ${totalCategories}`)
    console.log(`🛍️  Total products: ${totalProducts}`)

  } catch (error) {
    console.error('❌ Error during seeding:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedData()