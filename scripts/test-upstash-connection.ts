#!/usr/bin/env tsx

import 'dotenv/config'
import { createClient } from 'redis'

async function testUpstashConnection() {
  console.log('🔄 Testing Upstash Redis connection...')
  
  const redisUrl = process.env.REDIS_URL
  console.log('Redis URL:', redisUrl?.replace(/:[^:@]*@/, ':***@')) // Hide password
  
  if (!redisUrl) {
    console.error('❌ No REDIS_URL found in environment')
    return
  }
  
  try {
    console.log('\n1. Creating Redis client...')
    const redis = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 15000,
        tls: redisUrl.startsWith('rediss://') ? {} : undefined,
      },
    })

    redis.on('error', (err) => {
      console.error('Redis Error:', err.message)
    })

    redis.on('connect', () => {
      console.log('✅ Redis connected!')
    })

    redis.on('ready', () => {
      console.log('✅ Redis ready!')
    })

    console.log('\n2. Attempting connection...')
    await redis.connect()
    
    console.log('\n3. Testing ping...')
    const pingResult = await redis.ping()
    console.log('✅ Ping result:', pingResult)
    
    console.log('\n4. Testing set/get...')
    await redis.set('test:upstash', 'Hello Upstash!')
    const value = await redis.get('test:upstash')
    console.log('✅ Retrieved value:', value)
    
    console.log('\n5. Cleaning up...')
    await redis.del('test:upstash')
    await redis.disconnect()
    
    console.log('\n🎉 Upstash connection successful!')
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error)
    
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    console.log('\n💡 Troubleshooting tips:')
    console.log('1. Check if your Upstash database is active')
    console.log('2. Verify the Redis URL is correct')
    console.log('3. Make sure you\'re using rediss:// (with SSL)')
    console.log('4. Check Upstash dashboard for connection limits')
  }
}

testUpstashConnection().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Script failed:', error)
  process.exit(1)
})