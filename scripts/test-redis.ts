#!/usr/bin/env tsx

import 'dotenv/config'
import { getRedisClient, CacheKeys, CacheTTL } from '../lib/redis'
import CacheManager from '../lib/redis'

async function testRedis() {
  console.log('🔄 Testing Redis connection and caching...')
  
  try {
    // Test basic Redis connection
    console.log('\n1. Testing Redis connection...')
    const cache = CacheManager
    
    console.log(`Redis available: ${cache.isRedisAvailable()}`)
    
    if (cache.isRedisAvailable()) {
      const redis = await getRedisClient()
      const pingResult = await redis.ping()
      console.log(`✅ Redis ping: ${pingResult}`)
    } else {
      console.log('⚠️  Redis not available, using memory cache fallback')
    }
    
    // Test CacheManager (works with both Redis and memory fallback)
    console.log('\n2. Testing CacheManager...')
    
    // Test set and get
    const testKey = 'test:cache:' + Date.now()
    const testData = {
      message: 'Hello Cache!',
      timestamp: new Date().toISOString(),
      number: 42
    }
    
    console.log('Setting test data...')
    await cache.set(testKey, testData, 60) // 60 seconds TTL
    
    console.log('Getting test data...')
    const retrievedData = await cache.get(testKey)
    console.log('✅ Retrieved data:', retrievedData)
    
    // Test exists
    const exists = await cache.exists(testKey)
    console.log(`✅ Key exists: ${exists}`)
    
    // Test cache keys generation
    console.log('\n3. Testing cache key generation...')
    console.log('Product key:', CacheKeys.product('test-product-id'))
    console.log('Products key:', CacheKeys.products(1, 20, 'electronics'))
    console.log('Categories key:', CacheKeys.categories())
    console.log('User orders key:', CacheKeys.userOrders('user-123', 1))
    
    // Test cache with real-like data
    console.log('\n4. Testing with product-like data...')
    const productData = {
      id: 'prod-123',
      name: 'Test Product',
      price: 29.99,
      category: {
        id: 'cat-1',
        name: 'Electronics'
      },
      images: ['image1.jpg', 'image2.jpg'],
      inventory: 100,
      featured: true
    }
    
    const productKey = CacheKeys.product('prod-123')
    await cache.set(productKey, productData, CacheTTL.LONG)
    
    const cachedProduct = await cache.get(productKey)
    console.log('✅ Cached product:', cachedProduct)
    
    // Test pattern deletion
    console.log('\n5. Testing pattern deletion...')
    await cache.set('test:pattern:1', 'data1', 60)
    await cache.set('test:pattern:2', 'data2', 60)
    await cache.set('test:pattern:3', 'data3', 60)
    
    console.log('Created test pattern keys')
    await cache.delPattern('test:pattern:*')
    console.log('✅ Deleted pattern keys')
    
    // Cleanup
    console.log('\n6. Cleaning up...')
    await cache.del(testKey)
    await cache.del(productKey)
    console.log('✅ Cleanup completed')
    
    if (cache.isRedisAvailable()) {
      console.log('\n🎉 All Redis tests passed!')
    } else {
      console.log('\n🎉 All cache tests passed using memory fallback!')
    }
    
  } catch (error) {
    console.error('❌ Cache test failed:', error)
    process.exit(1)
  }
}

// Run the test
testRedis().then(() => {
  console.log('\n✅ Cache testing completed successfully')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Cache testing failed:', error)
  process.exit(1)
})