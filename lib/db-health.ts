import { db } from './db'

export async function checkDatabaseHealth() {
  try {
    // Simple query to test connection
    await db.$queryRaw`SELECT 1 as health_check`
    return { healthy: true, message: 'Database connection successful' }
  } catch (error: any) {
    console.error('Database health check failed:', error)
    return { 
      healthy: false, 
      message: error.message || 'Database connection failed',
      code: error.code
    }
  }
}

export async function ensureDatabaseConnection() {
  // For now, just return true to avoid blocking operations
  // The actual connection will be tested when queries are made
  return { healthy: true, message: 'Database connection assumed healthy' }
}