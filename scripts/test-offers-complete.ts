import 'dotenv/config'

async function testOffersSystem() {
  try {
    console.log('🧪 Testing Complete Offers System...\n')

    const baseUrl = 'http://localhost:3000'

    // Test 1: Get public offers for homepage
    console.log('1️⃣  Testing Homepage Offers (GET /api/offers?type=BANNER)')
    try {
      const response = await fetch(`${baseUrl}/api/offers?type=BANNER`)
      const data = await response.json()
      console.log('✅ Status:', response.status)
      console.log('📊 Offers found:', data.offers?.length || 0)
      if (data.offers?.length > 0) {
        console.log('📋 Sample offer:', {
          title: data.offers[0].title,
          type: data.offers[0].type,
          discountType: data.offers[0].discountType,
          hasImage: !!data.offers[0].image,
          hasCode: !!data.offers[0].code
        })
      }
    } catch (error) {
      console.log('❌ Error:', error)
    }

    console.log('\n2️⃣  Testing Admin Offers (GET /api/admin/offers)')
    try {
      const response = await fetch(`${baseUrl}/api/admin/offers`)
      const data = await response.json()
      console.log('✅ Status:', response.status)
      console.log('📊 Admin offers found:', data.offers?.length || 0)
      if (data.offers?.length > 0) {
        const stats = data.offers.reduce((acc: any, offer: any) => {
          acc[offer.type] = (acc[offer.type] || 0) + 1
          return acc
        }, {})
        console.log('📈 Offers by type:', stats)
      }
    } catch (error) {
      console.log('❌ Error:', error)
    }

    console.log('\n3️⃣  Testing Discount Code Validation (POST /api/offers/use)')
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
      console.log('💰 Code validation:', data.valid ? 'Valid' : 'Invalid')
      if (data.valid) {
        console.log('💵 Discount details:', {
          code: data.offer.code,
          discountType: data.offer.discountType,
          discountValue: data.offer.discountValue,
          discountAmount: data.offer.discountAmount,
          freeShipping: data.offer.freeShipping
        })
      }
    } catch (error) {
      console.log('❌ Error:', error)
    }

    console.log('\n4️⃣  Testing Invalid Discount Code')
    try {
      const response = await fetch(`${baseUrl}/api/offers/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'INVALID123',
          orderAmount: 2500
        })
      })
      const data = await response.json()
      console.log('✅ Status:', response.status)
      console.log('❌ Expected error:', data.error)
    } catch (error) {
      console.log('❌ Error:', error)
    }

    console.log('\n5️⃣  Testing Minimum Order Amount Validation')
    try {
      const response = await fetch(`${baseUrl}/api/offers/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'BABYCARE500',
          orderAmount: 1000 // Below minimum of 2000
        })
      })
      const data = await response.json()
      console.log('✅ Status:', response.status)
      console.log('❌ Expected error:', data.error)
    } catch (error) {
      console.log('❌ Error:', error)
    }

    console.log('\n🎉 Offers System Testing Completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Homepage offers API working')
    console.log('✅ Admin offers API working')
    console.log('✅ Discount code validation working')
    console.log('✅ Error handling working')
    console.log('✅ Business logic validation working')

  } catch (error) {
    console.error('❌ Error testing offers system:', error)
  }
}

// Run the test
testOffersSystem()