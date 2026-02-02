import { createClient } from 'redis'
import { Redis } from '@upstash/redis'

// Redis client singleton
let redis: ReturnType<typeof createClient> | null = null
let upstashRedis: Redis | null = null
let redisAvailable = false // Start as false, set to true only when connected
let connectionAttempted = false

// Initialize Upstash Redis client
function getUpstashClient(): Redis | null {
  if (!upstashRedis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    upstashRedis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return upstashRedis
}

export async function getRedisClient() {
  // Try Upstash REST API first (better for serverless)
  const upstash = getUpstashClient()
  if (upstash && !connectionAttempted) {
    try {
      connectionAttempted = true
      // Test connection with a simple ping
      await upstash.ping()
      redisAvailable = true
      console.log('✅ Using Upstash REST API')
      return upstash as any // Type compatibility
    } catch (error) {
      console.log('⚠️  Upstash REST API not available, trying direct Redis connection')
      connectionAttempted = false // Reset for direct Redis attempt
    }
  }

  // Return Upstash client if already connected
  if (upstash && redisAvailable) {
    return upstash as any
  }

  // Fallback to direct Redis connection
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    
    // Check if this is a secure Redis URL
    const isSecure = redisUrl.startsWith('rediss://') || redisUrl.includes('upstash.io')
    
    redis = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 10000,
        lazyConnect: true,
        tls: isSecure ? {} : undefined, // Enable TLS for secure connections
      },
    })

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err)
      redisAvailable = false
    })

    redis.on('connect', () => {
      console.log('Redis Client Connected')
      redisAvailable = true
    })

    redis.on('ready', () => {
      console.log('Redis Client Ready')
      redisAvailable = true
    })

    redis.on('end', () => {
      console.log('Redis Client Disconnected')
      redisAvailable = false
    })
  }

  if (!redis.isOpen && !connectionAttempted) {
    try {
      connectionAttempted = true
      console.log('Attempting to connect to Redis...')
      await redis.connect()
      redisAvailable = true
      console.log('Redis connection successful!')
    } catch (error) {
      console.error('Failed to connect to Redis, using memory fallback:', error)
      redisAvailable = false
    }
  }

  return redis
}

// In-memory fallback cache for when Redis is unavailable
class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>()
  private maxSize = 1000 // Limit memory usage

  set(key: string, value: any, ttl: number): void {
    // Clean up expired entries if cache is getting large
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const expiry = Date.now() + (ttl * 1000)
    this.cache.set(key, { value, expiry })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  del(key: string): void {
    this.cache.delete(key)
  }

  delPattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  exists(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

const memoryCache = new MemoryCache()

// Cache utility functions
export class CacheManager {
  private static instance: CacheManager
  private client: ReturnType<typeof createClient> | null = null

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  private async getClient() {
    if (!this.client) {
      this.client = await getRedisClient()
    }
    return this.client
  }

  // Get cached data
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!redisAvailable) {
        return memoryCache.get(key)
      }

      const client = await this.getClient()
      if (!client) {
        return memoryCache.get(key)
      }
      
      // Handle both Upstash and regular Redis clients
      const data = await client.get(key)
      
      if (!data) return null
      
      // Upstash REST API returns parsed JSON, regular Redis returns string
      if (typeof data === 'string') {
        try {
          return JSON.parse(data)
        } catch (parseError) {
          // If JSON parsing fails, return the string as-is
          return data as T
        }
      }
      
      return data as T
    } catch (error) {
      console.error('Cache get error, falling back to memory cache:', error)
      redisAvailable = false
      return memoryCache.get(key)
    }
  }

  // Set cached data with TTL (time to live in seconds)
  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    try {
      const client = await this.getClient()
      
      if (!redisAvailable || !client) {
        memoryCache.set(key, value, ttl)
        return true
      }
      
      // Handle both Upstash and regular Redis clients
      const serializedValue = JSON.stringify(value)
      
      if ('setex' in client && typeof client.setex === 'function') {
        // Upstash Redis client
        await client.setex(key, ttl, serializedValue)
      } else if ('setEx' in client && typeof client.setEx === 'function') {
        // Regular Redis client
        await client.setEx(key, ttl, serializedValue)
      }
      
      return true
    } catch (error) {
      console.error('Cache set error, falling back to memory cache:', error)
      redisAvailable = false
      memoryCache.set(key, value, ttl)
      return true
    }
  }

  // Delete cached data
  async del(key: string): Promise<boolean> {
    try {
      if (!redisAvailable) {
        memoryCache.del(key)
        return true
      }

      const client = await this.getClient()
      if (!client) {
        memoryCache.del(key)
        return true
      }
      
      // Handle both Upstash and regular Redis clients
      if ('del' in client && typeof client.del === 'function') {
        await client.del(key)
      }
      
      return true
    } catch (error) {
      console.error('Cache delete error, falling back to memory cache:', error)
      redisAvailable = false
      memoryCache.del(key)
      return true
    }
  }

  // Delete multiple keys by pattern
  async delPattern(pattern: string): Promise<boolean> {
    try {
      if (!redisAvailable) {
        memoryCache.delPattern(pattern)
        return true
      }

      const client = await this.getClient()
      if (!client) {
        memoryCache.delPattern(pattern)
        return true
      }
      
      // Handle both Upstash and regular Redis clients
      if ('keys' in client && 'del' in client) {
        const keys = await client.keys(pattern)
        if (keys && keys.length > 0) {
          await client.del(...keys)
        }
      }
      
      return true
    } catch (error) {
      console.error('Cache delete pattern error, falling back to memory cache:', error)
      redisAvailable = false
      memoryCache.delPattern(pattern)
      return true
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      if (!redisAvailable) {
        return memoryCache.exists(key)
      }

      const client = await this.getClient()
      if (!client) {
        return memoryCache.exists(key)
      }
      
      // Handle both Upstash and regular Redis clients
      if ('exists' in client && typeof client.exists === 'function') {
        const result = await client.exists(key)
        return result === 1 || result === true
      }
      
      return false
    } catch (error) {
      console.error('Cache exists error, falling back to memory cache:', error)
      redisAvailable = false
      return memoryCache.exists(key)
    }
  }

  // Set TTL for existing key
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      if (!redisAvailable) {
        // Memory cache doesn't support changing TTL of existing keys
        return false
      }

      const client = await this.getClient()
      await client.expire(key, ttl)
      return true
    } catch (error) {
      console.error('Cache expire error:', error)
      return false
    }
  }

  // Get TTL for key
  async ttl(key: string): Promise<number> {
    try {
      if (!redisAvailable) {
        return -1 // Memory cache doesn't track TTL
      }

      const client = await this.getClient()
      return await client.ttl(key)
    } catch (error) {
      console.error('Cache TTL error:', error)
      return -1
    }
  }

  // Check if Redis is available
  isRedisAvailable(): boolean {
    return redisAvailable
  }
}

// Cache key generators
export const CacheKeys = {
  // Product caching
  product: (id: string) => `product:${id}`,
  products: (page: number = 1, limit: number = 20, category?: string) => 
    `products:${page}:${limit}${category ? `:${category}` : ''}`,
  productsByCategory: (categoryId: string) => `products:category:${categoryId}`,
  
  // Category caching
  category: (id: string) => `category:${id}`,
  categories: () => 'categories:all',
  
  // User caching
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  userOrders: (userId: string, page: number = 1) => `user:orders:${userId}:${page}`,
  
  // Cart caching
  cart: (userId: string) => `cart:${userId}`,
  
  // Order caching
  order: (id: string) => `order:${id}`,
  orders: (page: number = 1, limit: number = 20) => `orders:${page}:${limit}`,
  
  // Offer caching
  offers: () => 'offers:active',
  offer: (id: string) => `offer:${id}`,
  
  // Admin caching
  adminStats: () => 'admin:stats',
  adminOrders: (page: number = 1, status?: string) => 
    `admin:orders:${page}${status ? `:${status}` : ''}`,
  
  // Analytics caching
  analytics: (period: string) => `analytics:${period}`,
}

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400, // 24 hours
  WEEK: 604800,    // 7 days
}

export default CacheManager.getInstance()