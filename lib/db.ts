import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with proper configuration for Vercel and Prisma 7
const createPrismaClient = () => {
  try {
    const connectionString = process.env.DATABASE_URL!
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    })
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    // Fallback to basic client with adapter
    const connectionString = process.env.DATABASE_URL!
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    
    return new PrismaClient({
      adapter,
      log: ['error'],
      errorFormat: 'minimal'
    })
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

// Handle connection errors gracefully
db.$on('error' as never, (e: any) => {
  console.error('Prisma client error:', e)
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db