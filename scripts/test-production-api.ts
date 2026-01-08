#!/usr/bin/env tsx
import 'dotenv/config'

async function testProductionAPI() {
  const baseUrl = 'https://blissbaby.vercel.app'
  
  console.log('🧪 Testing production API endpoints...')
  
  try {
    // Test categories endpoint
    console.log('\n📂 Testing categories endpoint...')
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`)
    const categoriesData = await categoriesResponse.json()
    
    if (categoriesResponse.ok) {
      console.log('✅ Categories API working!')
      console.log(`Found ${categoriesData.categories?.length || 0} categories`)
      if (categoriesData.categories?.length > 0) {
        console.log('Sample category:', categoriesData.categories[0].name)
      }
    } else {
      console.log('❌ Categories API failed:', categoriesData)
    }
    
    // Test products endpoint
    console.log('\n📦 Testing products endpoint...')
    const productsResponse = await fetch(`${baseUrl}/api/products`)
    const productsData = await productsResponse.json()
    
    if (productsResponse.ok) {
      console.log('✅ Products API working!')
      console.log(`Found ${productsData.products?.length || 0} products`)
      if (productsData.products?.length > 0) {
        console.log('Sample product:', productsData.products[0].name)
      }
    } else {
      console.log('❌ Products API failed:', productsData)
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

testProductionAPI()