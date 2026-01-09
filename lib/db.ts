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
  
  return new PrismaPg(new Pool({ 
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    acquireTimeoutMillis: 60000,
    ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined
  }))
}

// Create Prisma client with required adapter for Prisma 7
export const db = globalForPrisma.prisma ?? new PrismaClient({
  adapter: createAdapter(),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db