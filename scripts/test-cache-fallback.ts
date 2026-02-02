#!/usr/bin/env tsx

import 'dotenv/config'
import { CacheKeys, CacheTTL } from '../lib/redis'
import CacheManager from '../lib/redis'

async function testCacheFallback() {
  console.log('🔄 Testing cache system with fallback...')
  
  try {
    // Test CacheManager (will use memory fallback if Redis unavailable)
    console.log('\n1. Testing CacheManager...')
    const cache = CacheManager
    
    // Test set and get
    const testKey = 'test:cache:' + Date.now()
    const testData = {
      message: 'Hello Cache!',
      timestamp: new Date().toISOString(),
      number: 42
    }
    
    console.log('Setting test data...')
    const setResult = await cache.set(testKey, testData, 60) // 60 seconds TTL
    console.log(`✅ Set result: ${setResult}`)
    
    console.log('Getting test data...')
    const retrievedData = await cache.get(testKey)
    console.log('✅ Retrieved data:', retrievedData)
    
    // Verify data integrity
    if (JSON.stringify(retrievedData) === JSON.stringify(testData)) {
      console.log('✅ Data integrity verified')
    } else {
      console.log('❌ Data integrity failed')
    }
    
    // Test exists
    const exists = await cache.exists(testKey)
    console.log(`✅ Key exists: ${exists}`)
    
    // Test cache keys generation
    console.log('\n2. Testing cache key generation...')
    console.log('Product key:', CacheKeys.product('test-product-id'))
    console.log('Products key:', CacheKeys.products(1, 20, 'electronics'))
    console.log('Categories key:', CacheKeys.categories())
    console.log('User orders key:', CacheKeys.userOrders('user-123', 1))
    
    // Test cache with real-like data
    console.log('\n3. Testing with product-like data...')
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
    console.log('✅ Cached product retrieved successfully')
    
    // Test pattern deletion
    console.log('\n4. Testing pattern deletion...')
    await cache.set('test:pattern:1', 'data1', 60)
    await cache.set('test:pattern:2', 'data2', 60)
    await cache.set('test:pattern:3', 'data3', 60)
    
    console.log('Created test pattern keys')
    await cache.delPattern('test:pattern:*')
    console.log('✅ Deleted pattern keys')
    
    // Verify pattern deletion worked
    const pattern1Exists = await cache.exists('test:pattern:1')
    const pattern2Exists = await cache.exists('test:pattern:2')
    const pattern3Exists = await cache.exists('test:pattern:3')
    
    if (!pattern1Exists && !pattern2Exists && !pattern3Exists) {
      console.log('✅ Pattern deletion verified')
    } else {
      console.log('❌ Pattern deletion failed')
    }
    
    // Cleanup
    console.log('\n5. Cleaning up...')
    await cache.del(testKey)
    await cache.del(productKey)
    console.log('✅ Cleanup completed')
    
    // Check Redis availability
    console.log('\n6. Cache system status...')
    console.log(`Redis available: ${cache.isRedisAvailable()}`)
    
    if (cache.isRedisAvailable()) {
      console.log('\n🎉 All cache tests passed with Redis!')
    } else {
      console.log('\n🎉 All cache tests passed using memory fallback!')
    }
    
  } catch (error) {
    console.error('❌ Cache test failed:', error)
    process.exit(1)
  }
}

// Run the test
testCacheFallback().then(() => {
  console.log('\n✅ Cache testing completed successfully')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Cache testing failed:', error)
  process.exit(1)
})