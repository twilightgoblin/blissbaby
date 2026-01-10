import 'dotenv/config'

async function testOffersAPI() {
  try {
    console.log('🧪 Testing Offers API endpoints...\n')

    const baseUrl = 'http://localhost:3000'

    // Test 1: Get public offers
    console.log('1️⃣  Testing GET /api/offers')
    try {
      const response = await fetch(`${baseUrl}/api/offers?type=BANNER`)
      const data = await response.json()
      console.log('✅ Status:', response.status)
      console.log('📊 Offers found:', data.offers?.length || 0)
      if (data.offers?.length > 0) {
        console.log('📋 First offer:', {
          title: data.offers[0].title,
          type: data.offers[0].type,
          discountType: data.offers[0].discountType
        })
      }
    } catch (error) {
      console.log('❌ Error:', error)
    }

    console.log('\n2️⃣  Testing GET /api/admin/offers')
    try {
      const response = await fetch(`${baseUrl}/api/admin/offers`)
      const data = await response.json()
      console.log('✅ Status:', response.status)
      console.log('📊 Admin offers found:', data?.length || 0)
      if (data?.length > 0) {
        console.log('📋 Offers by type:')
        const byType = data.reduce((acc: any, offer: any) => {
          acc[offer.type] = (acc[offer.type] || 0) + 1
          return acc
        }, {})
        console.log(byType)
      }
    } catch (error) {
      console.log('❌ Error:', error)
    }

    console.log('\n3️⃣  Testing discount code validation')
    try {
      const response = await fetch(`${baseUrl}/api/offers/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'BABYCARE500',
          orderAmount: 2500
        })
      })
      const data = await response.json()
      console.log('✅ Status:', response.status)
      console.log('💰 Discount validation:', data.valid ? 'Valid' : 'Invalid')
      if (data.valid) {
        console.log('💵 Discount amount:', data.offer.discountAmount)
      }
    } catch (error) {
      console.log('❌ Error:', error)
    }

    console.log('\n🎉 API testing completed!')

  } catch (error) {
    console.error('❌ Error testing APIs:', error)
  }
}

// Run the test
testOffersAPI()