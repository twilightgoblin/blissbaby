import 'dotenv/config'
import { db } from '../lib/db'

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...\n')

  try {
    // Test database connection
    await db.$connect()
    console.log('✅ Database connection successful')

    // Check table counts
    const userCount = await db.user.count()
    const productCount = await db.product.count()
    const orderCount = await db.order.count()
    const cartCount = await db.cart.count()

    console.log('\n📊 Database Statistics:')
    console.log(`   Users: ${userCount}`)
    console.log(`   Products: ${productCount}`)
    console.log(`   Orders: ${orderCount}`)
    console.log(`   Carts: ${cartCount}`)

    // Show sample data
    if (userCount > 0) {
      const sampleUser = await db.user.findFirst({
        include: {
          _count: {
            select: {
              orders: true,
              carts: true
            }
          }
        }
      })
      console.log(`\n👤 Sample User: ${sampleUser?.email} (${sampleUser?.role})`)
      console.log(`   Orders: ${sampleUser?._count.orders}, Carts: ${sampleUser?._count.carts}`)
    }

    if (productCount > 0) {
      const sampleProduct = await db.product.findFirst()
      console.log(`\n📦 Sample Product: ${sampleProduct?.name}`)
      console.log(`   Price: $${sampleProduct?.price}, Stock: ${sampleProduct?.inventory}`)
    }

    console.log('\n🎉 Database status check completed!')

  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await db.$disconnect()
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  checkDatabaseStatus()
}

export { checkDatabaseStatus }