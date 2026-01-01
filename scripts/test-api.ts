import 'dotenv/config'

const API_BASE = 'http://localhost:3000/api'

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n')

  try {
    // Test Products API
    console.log('📦 Testing Products API...')
    const productsResponse = await fetch(`${API_BASE}/products`)
    const productsData = await productsResponse.json()
    console.log(`✅ Found ${productsData.products?.length || 0} products`)

    if (productsData.products?.length > 0) {
      const firstProduct = productsData.products[0]
      console.log(`   First product: ${firstProduct.name} - ${firstProduct.price}`)
      
      // Test single product
      const productResponse = await fetch(`${API_BASE}/products/${firstProduct.id}`)
      const productData = await productResponse.json()
      console.log(`✅ Single product fetch: ${productData.product?.name}`)
    }

    // Test Cart API with a test Clerk user ID
    console.log('\n🛒 Testing Cart API...')
    const testClerkUserId = 'user_test123' // Replace with actual Clerk user ID for testing
    const cartResponse = await fetch(`${API_BASE}/cart?userId=${testClerkUserId}`)
    const cartData = await cartResponse.json()
    console.log(`✅ Cart fetched for Clerk user: ${cartData.cart?.items?.length || 0} items`)

    // Test adding to cart
    if (productsData.products?.length > 0) {
      const addToCartResponse = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testClerkUserId,
          productId: productsData.products[0].id,
          quantity: 2
        })
      })
      const addToCartData = await addToCartResponse.json()
      console.log(`✅ Added to cart: ${addToCartData.cartItem?.product?.name || 'Item added'}`)
    }

    // Test Orders API
    console.log('\n📋 Testing Orders API...')
    const ordersResponse = await fetch(`${API_BASE}/orders`)
    const ordersData = await ordersResponse.json()
    console.log(`✅ Found ${ordersData.orders?.length || 0} orders`)

    console.log('\n🎉 All API tests completed successfully!')
    console.log('\n📝 Note: Cart tests use a test Clerk user ID. Replace with actual Clerk user ID for real testing.')

  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  testAPI()
}

export { testAPI }