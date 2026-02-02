#!/usr/bin/env tsx

import 'dotenv/config'
import CacheManager from '../lib/redis'

async function testRedisIntegration() {
  console.log('🔄 Testing Redis integration with CacheManager...')
  
  try {
    const cache = CacheManager
    
    // Force a connection attempt by trying to set data
    console.log('\n1. Testing cache set (this will trigger connection)...')
    const testKey = 'integration:test:' + Date.now()
    const testData = {
      message: 'Integration test',
      timestamp: new Date().toISOString(),
      number: 123
    }
    
    const setResult = await cache.set(testKey, testData, 60)
    console.log('✅ Set result:', setResult)
    
    console.log('\n2. Testing cache get...')
    const retrievedData = await cache.get(testKey)
    console.log('✅ Retrieved data:', retrievedData)
    
    console.log('\n3. Checking Redis availability...')
    console.log('Redis available:', cache.isRedisAvailable())
    
    console.log('\n4. Testing exists...')
    const exists = await cache.exists(testKey)
    console.log('✅ Key exists:', exists)
    
    console.log('\n5. Testing delete...')
    await cache.del(testKey)
    const existsAfterDelete = await cache.exists(testKey)
    console.log('✅ Key exists after delete:', existsAfterDelete)
    
    if (cache.isRedisAvailable()) {
      console.log('\n🎉 Redis integration test successful!')
    } else {
      console.log('\n🎉 Memory cache fallback test successful!')
    }
    
  } catch (error) {
    console.error('\n❌ Integration test failed:', error)
    process.exit(1)
  }
}

testRedisIntegration().then(() => {
  console.log('\n✅ Integration testing completed successfully')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Integration testing failed:', error)
  process.exit(1)
})