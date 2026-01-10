import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    console.log('📡 Connection string:', connectionString.replace(/:[^:@]*@/, ':****@'))
    
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    
    const prisma = new PrismaClient({
      adapter,
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    })

    // Test basic connection
    console.log('🔌 Testing Prisma connection...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful:', result)

    // Check if categories table exists
    console.log('📋 Checking categories table...')
    const categories = await prisma.categories.findMany({ take: 1 })
    console.log('✅ Categories table accessible, found:', categories.length, 'categories')

    // Check if products table exists
    console.log('📦 Checking products table...')
    const products = await prisma.products.findMany({ take: 1 })
    console.log('✅ Products table accessible, found:', products.length, 'products')

    await prisma.$disconnect()
    console.log('🎉 All tests passed!')

  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

testConnection()