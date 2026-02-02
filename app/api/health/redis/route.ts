import { NextResponse } from 'next/server'
import CacheManager from '@/lib/redis'

export async function GET() {
  try {
    const cache = CacheManager
    
    // Test Redis connection with a simple set/get operation
    const testKey = 'health:check:' + Date.now()
    const testValue = 'redis-health-check'
    
    await cache.set(testKey, testValue, 10) // Set with 10 second expiry
    const retrievedValue = await cache.get(testKey)
    await cache.del(testKey) // Clean up
    
    const isHealthy = retrievedValue === testValue
    const isRedisAvailable = cache.isRedisAvailable()
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      redis: {
        available: isRedisAvailable,
        connection: isRedisAvailable ? 'connected' : 'using memory fallback',
        testOperation: isHealthy ? 'success' : 'failed'
      },
      timestamp: new Date().toISOString()
    }, {
      status: isHealthy ? 200 : 503
    })
  } catch (error) {
    console.error('Redis health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 503
    })
  }
}