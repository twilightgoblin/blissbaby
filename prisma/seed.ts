import 'dotenv/config'
import { PrismaClient, UserRole, ProductStatus } from '../lib/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  })

  // Create customer user
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'John Doe',
      phone: '+1234567890',
      role: UserRole.CUSTOMER,
    },
  })

  // Create customer address
  await prisma.address.upsert({
    where: { id: 'default-address' },
    update: {},
    create: {
      id: 'default-address',
      userId: customerUser.id,
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '+1234567890',
      isDefault: true,
    },
  })

  // Create sample products
  const products = [
    {
      name: 'Organic Baby Onesie',
      description: 'Soft organic cotton onesie perfect for newborns',
      price: 24.99,
      category: 'Clothing',
      brand: 'BabyComfort',
      images: ['/baby-onesie-organic-cotton.jpg'],
      inventory: 50,
      sku: 'BC-ONESIE-001',
      tags: ['organic', 'cotton', 'newborn'],
    },
    {
      name: 'Baby Feeding Bottle Set',
      description: 'BPA-free feeding bottles with anti-colic system',
      price: 39.99,
      category: 'Feeding',
      brand: 'FeedWell',
      images: ['/baby-feeding-bottles.jpg'],
      inventory: 30,
      sku: 'FW-BOTTLE-SET-001',
      tags: ['feeding', 'bpa-free', 'anti-colic'],
    },
    {
      name: 'Soft Teddy Bear',
      description: 'Cuddly teddy bear made from hypoallergenic materials',
      price: 19.99,
      category: 'Toys',
      brand: 'CuddleToys',
      images: ['/soft-teddy-bear-baby-toy.jpg'],
      inventory: 25,
      sku: 'CT-TEDDY-001',
      tags: ['toy', 'soft', 'hypoallergenic'],
    },
    {
      name: 'Baby Care Products Set',
      description: 'Complete baby care set with shampoo, lotion, and soap',
      price: 34.99,
      category: 'Care',
      brand: 'GentleCare',
      images: ['/baby-care-products.png'],
      inventory: 40,
      sku: 'GC-CARE-SET-001',
      tags: ['care', 'gentle', 'natural'],
    },
    {
      name: 'Colorful Baby Toys Set',
      description: 'Educational colorful toys for cognitive development',
      price: 29.99,
      category: 'Toys',
      brand: 'SmartPlay',
      images: ['/colorful-baby-toys.png'],
      inventory: 35,
      sku: 'SP-TOYS-001',
      tags: ['educational', 'colorful', 'development'],
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        ...product,
        status: ProductStatus.ACTIVE,
        featured: Math.random() > 0.5, // Randomly feature some products
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Admin user: ${adminUser.email}`)
  console.log(`👤 Customer user: ${customerUser.email}`)
  console.log(`📦 Created ${products.length} products`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })