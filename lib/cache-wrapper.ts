import CacheManager, { CacheKeys, CacheTTL } from './redis'

// Generic cache wrapper function
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM,
  options: {
    skipCache?: boolean
    refreshCache?: boolean
  } = {}
): Promise<T> {
  const cache = CacheManager

  // Skip cache if requested
  if (options.skipCache) {
    return await fetcher()
  }

  // Try to get from cache first
  if (!options.refreshCache) {
    const cached = await cache.get<T>(key)
    if (cached !== null) {
      return cached
    }
  }

  // Fetch fresh data
  const data = await fetcher()
  
  // Cache the result
  await cache.set(key, data, ttl)
  
  return data
}

// Cache invalidation helpers
export class CacheInvalidator {
  private static cache = CacheManager

  // Invalidate product-related caches
  static async invalidateProduct(productId: string) {
    await Promise.all([
      this.cache.del(CacheKeys.product(productId)),
      this.cache.delPattern('products:*'),
      this.cache.delPattern('products:category:*'),
    ])
  }

  // Invalidate category-related caches
  static async invalidateCategory(categoryId: string) {
    await Promise.all([
      this.cache.del(CacheKeys.category(categoryId)),
      this.cache.del(CacheKeys.categories()),
      this.cache.delPattern('products:*'),
      this.cache.delPattern('products:category:*'),
    ])
  }

  // Invalidate user-related caches
  static async invalidateUser(userId: string) {
    await Promise.all([
      this.cache.del(CacheKeys.user(userId)),
      this.cache.del(CacheKeys.userProfile(userId)),
      this.cache.delPattern(`user:orders:${userId}:*`),
      this.cache.del(CacheKeys.cart(userId)),
    ])
  }

  // Invalidate order-related caches
  static async invalidateOrder(orderId: string, userId?: string) {
    const promises = [
      this.cache.del(CacheKeys.order(orderId)),
      this.cache.delPattern('orders:*'),
      this.cache.delPattern('admin:orders:*'),
      this.cache.del(CacheKeys.adminStats()),
    ]

    if (userId) {
      promises.push(this.cache.delPattern(`user:orders:${userId}:*`))
    }

    await Promise.all(promises)
  }

  // Invalidate cart-related caches
  static async invalidateCart(userId: string) {
    await this.cache.del(CacheKeys.cart(userId))
  }

  // Invalidate offer-related caches
  static async invalidateOffers() {
    await Promise.all([
      this.cache.del(CacheKeys.offers()),
      this.cache.delPattern('offer:*'),
    ])
  }

  // Invalidate admin stats
  static async invalidateAdminStats() {
    await Promise.all([
      this.cache.del(CacheKeys.adminStats()),
      this.cache.delPattern('analytics:*'),
    ])
  }

  // Clear all caches (use with caution)
  static async clearAll() {
    await this.cache.delPattern('*')
  }
}

// Cached database operations
export class CachedQueries {
  private static cache = CacheManager

  // Get products with caching
  static async getProducts(
    page: number = 1,
    limit: number = 20,
    categoryId?: string,
    options: { skipCache?: boolean } = {}
  ) {
    const key = CacheKeys.products(page, limit, categoryId)
    
    return withCache(
      key,
      async () => {
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()
        
        try {
          const skip = (page - 1) * limit
          const where = categoryId ? { categoryId } : {}
          
          const [products, total] = await Promise.all([
            prisma.product.findMany({
              where,
              skip,
              take: limit,
              include: {
                category: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            }),
            prisma.product.count({ where }),
          ])
          
          return {
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          }
        } finally {
          await prisma.$disconnect()
        }
      },
      CacheTTL.MEDIUM,
      options
    )
  }

  // Get single product with caching
  static async getProduct(id: string, options: { skipCache?: boolean } = {}) {
    const key = CacheKeys.product(id)
    
    return withCache(
      key,
      async () => {
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()
        
        try {
          return await prisma.product.findUnique({
            where: { id },
            include: {
              category: true,
            },
          })
        } finally {
          await prisma.$disconnect()
        }
      },
      CacheTTL.LONG,
      options
    )
  }

  // Get categories with caching
  static async getCategories(options: { skipCache?: boolean } = {}) {
    const key = CacheKeys.categories()
    
    return withCache(
      key,
      async () => {
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()
        
        try {
          return await prisma.category.findMany({
            orderBy: {
              name: 'asc',
            },
          })
        } finally {
          await prisma.$disconnect()
        }
      },
      CacheTTL.VERY_LONG,
      options
    )
  }

  // Get user orders with caching
  static async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
    options: { skipCache?: boolean } = {}
  ) {
    const key = CacheKeys.userOrders(userId, page)
    
    return withCache(
      key,
      async () => {
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()
        
        try {
          const skip = (page - 1) * limit
          
          const [orders, total] = await Promise.all([
            prisma.order.findMany({
              where: { userId },
              skip,
              take: limit,
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            }),
            prisma.order.count({ where: { userId } }),
          ])
          
          return {
            orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          }
        } finally {
          await prisma.$disconnect()
        }
      },
      CacheTTL.SHORT,
      options
    )
  }

  // Get active offers with caching
  static async getActiveOffers(options: { skipCache?: boolean } = {}) {
    const key = CacheKeys.offers()
    
    return withCache(
      key,
      async () => {
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()
        
        try {
          const now = new Date()
          return await prisma.offer.findMany({
            where: {
              isActive: true,
              startDate: {
                lte: now,
              },
              endDate: {
                gte: now,
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          })
        } finally {
          await prisma.$disconnect()
        }
      },
      CacheTTL.MEDIUM,
      options
    )
  }
}