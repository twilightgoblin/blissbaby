import 'dotenv/config'
import { db } from '../lib/db'

async function backfillCartItems() {
  console.log('Starting cart items backfill...')

  try {
    // Get all cart items
    const cartItems = await db.cartItem.findMany({
      include: {
        product: true,
        cart: {
          include: {
            user: true
          }
        }
      }
    })

    console.log(`Found ${cartItems.length} cart items to update`)

    let updated = 0
    for (const item of cartItems) {
      await db.cartItem.update({
        where: { id: item.id },
        data: {
          productName: item.product.name,
          userName: item.cart.user.name,
          userEmail: item.cart.user.email
        }
      })
      updated++
      
      if (updated % 10 === 0) {
        console.log(`Updated ${updated}/${cartItems.length} cart items`)
      }
    }

    console.log(`✅ Successfully updated ${updated} cart items`)
  } catch (error) {
    console.error('❌ Error during backfill:', error)
    process.exit(1)
  }
}

// Run the backfill
backfillCartItems()
  .then(() => {
    console.log('Backfill completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Backfill failed:', error)
    process.exit(1)
  })