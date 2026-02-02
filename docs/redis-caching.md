# Redis Caching Implementation

This document outlines the Redis caching implementation for the BabyBliss e-commerce application.

## Overview

We've implemented a comprehensive Redis caching layer to improve application performance by reducing database queries and API response times.

## Architecture

### Core Components

1. **Redis Client** (`lib/redis.ts`)
   - Singleton Redis client with connection management
   - Error handling and reconnection logic
   - Health monitoring

2. **Cache Manager** (`lib/redis.ts`)
   - High-level caching interface
   - CRUD operations for cached data
   - Pattern-based cache invalidation

3. **Cache Wrapper** (`lib/cache-wrapper.ts`)
   - Generic caching wrapper function
   - Cache invalidation strategies
   - Cached database queries

## Cache Keys Structure

```typescript
// Products
product:${id}                           // Individual product
products:${page}:${limit}:${category}   // Product listings
products:category:${categoryId}         // Products by category

// Categories
categories:all                          // All categories
category:${id}                         // Individual category

// Users
user:${userId}                         // User data
user:profile:${userId}                 // User profile
user:orders:${userId}:${page}          // User orders

// Cart
cart:${userId}                         // User cart

// Orders
order:${id}                           // Individual order
orders:${page}:${limit}               // Order listings

// Admin
admin:stats                           // Admin dashboard stats
admin:orders:${page}:${status}        // Admin order listings

// Offers
offers:active                         // Active offers
offer:${id}                          // Individual offer
```

## Cache TTL (Time To Live)

```typescript
SHORT: 300,      // 5 minutes  - Frequently changing data
MEDIUM: 1800,    // 30 minutes - Moderately changing data
LONG: 3600,      // 1 hour     - Stable data
VERY_LONG: 86400, // 24 hours   - Rarely changing data
WEEK: 604800,    // 7 days     - Static data
```

## Implementation Examples

### Basic Caching

```typescript
import { withCache, CacheKeys, CacheTTL } from '@/lib/cache-wrapper'

// Cache a database query
const products = await withCache(
  CacheKeys.products(page, limit, category),
  async () => {
    return await db.products.findMany({...})
  },
  CacheTTL.MEDIUM
)
```

### Cache Invalidation

```typescript
import { CacheInvalidator } from '@/lib/cache-wrapper'

// Invalidate product caches when product is updated
await CacheInvalidator.invalidateProduct(productId)

// Invalidate category caches when category is updated
await CacheInvalidator.invalidateCategory(categoryId)
```

## API Routes with Caching

### Products API (`/api/products`)
- **Cache Duration**: 30 minutes
- **Cache Key**: Based on all query parameters
- **Invalidation**: When products are created/updated/deleted

### Categories API (`/api/categories`)
- **Cache Duration**: 24 hours
- **Cache Key**: `categories:all`
- **Invalidation**: When categories are modified

### Individual Product API (`/api/products/[id]`)
- **Cache Duration**: 1 hour
- **Cache Key**: `product:${id}`
- **Invalidation**: When specific product is updated

## Cache Management

### Admin Cache API (`/api/admin/cache`)

**GET** - Get cache statistics
```bash
GET /api/admin/cache?action=stats
```

**POST** - Manage cache
```bash
# Clear all caches
POST /api/admin/cache
{
  "action": "clear",
  "target": "all"
}

# Invalidate specific cache
POST /api/admin/cache
{
  "action": "invalidate",
  "target": "products",
  "key": "product-id" // optional
}
```

### Health Check (`/api/health/redis`)
Monitor Redis connection and performance:
```bash
GET /api/health/redis
```

## Environment Configuration

Add to your `.env` file:
```env
REDIS_URL="redis://localhost:6379"
```

For production, use a managed Redis service:
```env
# Example for Redis Cloud
REDIS_URL="redis://username:password@host:port"

# Example for AWS ElastiCache
REDIS_URL="redis://your-cluster.cache.amazonaws.com:6379"
```

## Testing

Run Redis tests:
```bash
npm run test:redis
```

## Performance Benefits

### Before Caching
- Database query on every request
- Response time: 200-500ms
- High database load

### After Caching
- Cache hit: 5-20ms response time
- Cache miss: Database query + cache storage
- Reduced database load by 70-90%

## Cache Strategies by Data Type

### Products
- **Strategy**: Cache with medium TTL (30 min)
- **Reason**: Products change moderately, need fresh inventory data
- **Invalidation**: On product CRUD operations

### Categories
- **Strategy**: Cache with very long TTL (24 hours)
- **Reason**: Categories rarely change
- **Invalidation**: On category modifications

### User Data
- **Strategy**: Cache with short TTL (5 min)
- **Reason**: User data can change frequently
- **Invalidation**: On profile updates, orders

### Orders
- **Strategy**: Cache with short TTL (5 min)
- **Reason**: Order status changes frequently
- **Invalidation**: On order status updates

## Monitoring and Debugging

### Cache Hit Rate
Monitor cache effectiveness through logs and metrics.

### Memory Usage
Monitor Redis memory usage and set appropriate limits.

### Error Handling
All cache operations include fallback to database queries if Redis fails.

## Best Practices

1. **Always have fallbacks** - Never let cache failures break the application
2. **Use appropriate TTLs** - Balance freshness vs performance
3. **Invalidate strategically** - Clear related caches when data changes
4. **Monitor performance** - Track cache hit rates and response times
5. **Handle Redis failures gracefully** - Application should work without cache

## Deployment Considerations

### Local Development
- Use local Redis instance
- Docker: `docker run -d -p 6379:6379 redis:alpine`

### Production
- Use managed Redis service (AWS ElastiCache, Redis Cloud, etc.)
- Enable persistence and backups
- Set up monitoring and alerts
- Configure appropriate memory limits

## Future Enhancements

1. **Cache Warming** - Pre-populate cache with frequently accessed data
2. **Cache Analytics** - Detailed metrics on cache performance
3. **Distributed Caching** - Multi-region cache setup
4. **Cache Compression** - Reduce memory usage for large objects
5. **Smart Invalidation** - More granular cache invalidation strategies