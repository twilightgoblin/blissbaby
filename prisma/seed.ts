import 'dotenv/config'
import { PrismaClient, UserRole, ProductStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Baby Feeding' },
      update: {},
      create: {
        name: 'Baby Feeding',
        description: 'Bottles, sippy cups, high chairs, bibs, and feeding accessories',
        icon: null,
        color: 'bg-blue-100',
        sortOrder: 1
      }
    }),
    prisma.category.upsert({
      where: { name: 'Diapers & Wipes' },
      update: {},
      create: {
        name: 'Diapers & Wipes',
        description: 'Disposable diapers, cloth diapers, wipes, and changing essentials',
        icon: null,
        color: 'bg-green-100',
        sortOrder: 2
      }
    }),
    prisma.category.upsert({
      where: { name: 'Baby Clothing' },
      update: {},
      create: {
        name: 'Baby Clothing',
        description: 'Onesies, sleepers, outfits, socks, and clothing accessories',
        icon: null,
        color: 'bg-pink-100',
        sortOrder: 3
      }
    }),
    prisma.category.upsert({
      where: { name: 'Toys & Development' },
      update: {},
      create: {
        name: 'Toys & Development',
        description: 'Educational toys, teethers, rattles, and developmental play items',
        icon: null,
        color: 'bg-yellow-100',
        sortOrder: 4
      }
    }),
    prisma.category.upsert({
      where: { name: 'Baby Care & Health' },
      update: {},
      create: {
        name: 'Baby Care & Health',
        description: 'Lotions, shampoos, thermometers, and health monitoring',
        icon: null,
        color: 'bg-teal-100',
        sortOrder: 5
      }
    }),
    prisma.category.upsert({
      where: { name: 'Strollers & Car Seats' },
      update: {},
      create: {
        name: 'Strollers & Car Seats',
        description: 'Strollers, car seats, carriers, and travel systems',
        icon: null,
        color: 'bg-orange-100',
        sortOrder: 6
      }
    }),
    prisma.category.upsert({
      where: { name: 'Nursery Furniture' },
      update: {},
      create: {
        name: 'Nursery Furniture',
        description: 'Cribs, changing tables, dressers, and nursery storage',
        icon: null,
        color: 'bg-purple-100',
        sortOrder: 7
      }
    }),
    prisma.category.upsert({
      where: { name: 'Baby Sleep' },
      update: {},
      create: {
        name: 'Baby Sleep',
        description: 'Mattresses, bedding, sleep sacks, and sleep aids',
        icon: null,
        color: 'bg-indigo-100',
        sortOrder: 8
      }
    }),
    prisma.category.upsert({
      where: { name: 'Bath Time' },
      update: {},
      create: {
        name: 'Bath Time',
        description: 'Baby bathtubs, bath toys, towels, and bath accessories',
        icon: null,
        color: 'bg-cyan-100',
        sortOrder: 9
      }
    }),
    prisma.category.upsert({
      where: { name: 'Baby Gear' },
      update: {},
      create: {
        name: 'Baby Gear',
        description: 'Bouncers, swings, play yards, and activity centers',
        icon: null,
        color: 'bg-rose-100',
        sortOrder: 10
      }
    }),
    prisma.category.upsert({
      where: { name: 'Maternity' },
      update: {},
      create: {
        name: 'Maternity',
        description: 'Maternity clothing, nursing bras, and pregnancy essentials',
        icon: null,
        color: 'bg-emerald-100',
        sortOrder: 11
      }
    }),
    prisma.category.upsert({
      where: { name: 'Baby Safety' },
      update: {},
      create: {
        name: 'Baby Safety',
        description: 'Baby gates, outlet covers, cabinet locks, and safety gear',
        icon: null,
        color: 'bg-red-100',
        sortOrder: 12
      }
    }),
    prisma.category.upsert({
      where: { name: 'Books & Learning' },
      update: {},
      create: {
        name: 'Books & Learning',
        description: 'Board books, picture books, and educational materials',
        icon: null,
        color: 'bg-amber-100',
        sortOrder: 13
      }
    }),
    prisma.category.upsert({
      where: { name: 'Baby Monitors' },
      update: {},
      create: {
        name: 'Baby Monitors',
        description: 'Audio monitors, video monitors, and smart monitoring devices',
        icon: null,
        color: 'bg-slate-100',
        sortOrder: 14
      }
    }),
    prisma.category.upsert({
      where: { name: 'Pacifiers & Teethers' },
      update: {},
      create: {
        name: 'Pacifiers & Teethers',
        description: 'Pacifiers, teething toys, and soothing accessories',
        icon: null,
        color: 'bg-lime-100',
        sortOrder: 15
      }
    })
  ])

  console.log('✅ Categories created:', categories.length)

  // Create sample products with Indian pricing
  const sampleProducts = [
    {
      name: 'Premium Baby Bottle Set',
      description: 'BPA-free baby bottles with anti-colic system. Perfect for newborns and growing babies.',
      price: 1299.00,
      comparePrice: 1599.00,
      categoryId: categories[0].id, // Baby Feeding
      brand: 'BabyBliss',
      inventory: 50,
      lowStock: 10,
      sku: 'BB-BOTTLE-001',
      featured: true,
      status: ProductStatus.ACTIVE,
      tags: ['bottles', 'feeding', 'anti-colic'],
      images: []
    },
    {
      name: 'Organic Cotton Diapers (Pack of 30)',
      description: 'Ultra-soft organic cotton diapers with superior absorption. Gentle on baby\'s skin.',
      price: 899.00,
      comparePrice: 1099.00,
      categoryId: categories[1].id, // Diapers & Wipes
      brand: 'EcoSoft',
      inventory: 100,
      lowStock: 20,
      sku: 'ES-DIAPER-001',
      featured: true,
      status: ProductStatus.ACTIVE,
      tags: ['diapers', 'organic', 'cotton'],
      images: []
    },
    {
      name: 'Cute Baby Onesie Set (3-Pack)',
      description: 'Adorable cotton onesies in various colors. Soft, comfortable, and easy to wash.',
      price: 699.00,
      categoryId: categories[2].id, // Baby Clothing
      brand: 'TinyTots',
      inventory: 75,
      lowStock: 15,
      sku: 'TT-ONESIE-001',
      featured: false,
      status: ProductStatus.ACTIVE,
      tags: ['clothing', 'onesie', 'cotton'],
      images: []
    },
    {
      name: 'Educational Stacking Rings',
      description: 'Colorful stacking rings that help develop hand-eye coordination and color recognition.',
      price: 449.00,
      categoryId: categories[3].id, // Toys & Development
      brand: 'PlaySmart',
      inventory: 30,
      lowStock: 5,
      sku: 'PS-STACK-001',
      featured: false,
      status: ProductStatus.ACTIVE,
      tags: ['toys', 'educational', 'development'],
      images: []
    },
    {
      name: 'Gentle Baby Shampoo',
      description: 'Tear-free baby shampoo with natural ingredients. Perfect for daily use.',
      price: 299.00,
      categoryId: categories[4].id, // Baby Care & Health
      brand: 'PureCare',
      inventory: 5, // Low stock to test alert
      lowStock: 10,
      sku: 'PC-SHAMPOO-001',
      featured: false,
      status: ProductStatus.ACTIVE,
      tags: ['shampoo', 'gentle', 'natural'],
      images: []
    },
    {
      name: 'Lightweight Travel Stroller',
      description: 'Compact and lightweight stroller perfect for travel. Easy one-hand fold.',
      price: 8999.00,
      comparePrice: 10999.00,
      categoryId: categories[5].id, // Strollers & Car Seats
      brand: 'TravelEase',
      inventory: 15,
      lowStock: 3,
      sku: 'TE-STROLLER-001',
      featured: true,
      status: ProductStatus.ACTIVE,
      tags: ['stroller', 'travel', 'lightweight'],
      images: []
    }
  ]

  const products = await Promise.all(
    sampleProducts.map(product =>
      prisma.product.upsert({
        where: { sku: product.sku },
        update: {},
        create: product
      })
    )
  )

  console.log('✅ Sample products created:', products.length)
  console.log('⚠️  Please change the admin email in prisma/seed.ts to your actual email')
  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })