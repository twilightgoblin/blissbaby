import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create database adapter for Prisma 7
const createAdapter = () => {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    // For build time when DATABASE_URL might not be available
    // Use a dummy connection that won't actually connect
    return new PrismaPg(new Pool({ 
      connectionString: "postgresql://user:pass@localhost:5432/db",
      max: 1,
    }))
  }
  
  // Configuration for Supabase pooler with better error handling
  const poolConfig = {
    connectionString,
    max: process.env.NODE_ENV === 'production' ? 2 : 3, // Lower for production
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000, // Increased timeout
    acquireTimeoutMillis: 60000,
    allowExitOnIdle: true, // Allow pool to close when idle
    ssl: {
      rejectUnauthorized: false
    }
  }
  
  const pool = new Pool(poolConfig)
  
  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Database pool error:', err)
  })
  
  return new PrismaPg(pool)
}

// Create Prisma client with required adapter for Prisma 7
export const db = globalForPrisma.prisma ?? new PrismaClient({
  adapter: createAdapter(),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// Handle Prisma client errors
db.$on('error' as never, (e: any) => {
  console.error('Prisma client error:', e)
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect()
})