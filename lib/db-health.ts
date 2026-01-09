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
  const health = await checkDatabaseHealth()
  if (!health.healthy) {
    throw new Error(`Database connection failed: ${health.message}`)
  }
  return health
}