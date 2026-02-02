#!/usr/bin/env tsx

import 'dotenv/config'
import { Redis } from '@upstash/redis'

async function testUpstashRest() {
  console.log('🔄 Testing Upstash REST API...')
  
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  
  console.log('REST URL:', url)
  console.log('Token:', token ? `${token.substring(0, 10)}...` : 'Not found')
  
  if (!url || !token) {
    console.error('❌ Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN')
    return
  }
  
  try {
    console.log('\n1. Creating Upstash Redis client...')
    const redis = new Redis({
      url,
      token,
    })
    
    console.log('\n2. Testing ping...')
    const pingResult = await redis.ping()
    console.log('✅ Ping result:', pingResult)
    
    console.log('\n3. Testing set/get...')
    const testKey = 'test:upstash:' + Date.now()
    const testValue = { message: 'Hello Upstash REST!', timestamp: new Date().toISOString() }
    
    await redis.setex(testKey, 60, JSON.stringify(testValue))
    console.log('✅ Set value successfully')
    
    const retrievedValue = await redis.get(testKey)
    console.log('✅ Retrieved value:', retrievedValue)
    
    // Check if it's already parsed or needs parsing
    let parsed = retrievedValue
    if (typeof retrievedValue === 'string') {
      parsed = JSON.parse(retrievedValue)
    }
    console.log('✅ Parsed value:', parsed)
    
    console.log('\n4. Testing exists...')
    const exists = await redis.exists(testKey)
    console.log('✅ Key exists:', exists)
    
    console.log('\n5. Testing delete...')
    await redis.del(testKey)
    const existsAfterDelete = await redis.exists(testKey)
    console.log('✅ Key exists after delete:', existsAfterDelete)
    
    console.log('\n🎉 Upstash REST API test successful!')
    
  } catch (error) {
    console.error('\n❌ Upstash REST API test failed:', error)
    
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
  }
}

testUpstashRest().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Script failed:', error)
  process.exit(1)
})