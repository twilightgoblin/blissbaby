import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with proper configuration for Vercel
const createPrismaClient = () => {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    // Fallback to basic client
    return new PrismaClient({
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

// Graceful shutdown
process.on('beforeExit', async () => {
  try {
    await db.$disconnect()
  } catch (error) {
    console.error('Error disconnecting Prisma:', error)
  }
})