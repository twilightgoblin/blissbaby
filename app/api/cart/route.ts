import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateCart, addToCart, getClerkUserInfo } from '@/lib/db-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clerkUserId = searchParams.get('userId')

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const cart = await getOrCreateCart(clerkUserId)
    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Error fetching cart:', error)
    
    // If Prisma fails, try raw SQL as fallback
    try {
      const { searchParams } = new URL(request.url)
      const clerkUserId = searchParams.get('userId')

      if (!clerkUserId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        )
      }

      const { Pool } = await import('pg')
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        ssl: { rejectUnauthorized: false }
      })
      
      const client = await pool.connect()
      
      // Get or create cart using raw SQL
      let cartResult = await client.query(`
        SELECT * FROM carts WHERE "clerkUserId" = $1
      `, [clerkUserId])
      
      if (cartResult.rows.length === 0) {
        // Create new cart
        const cartId = crypto.randomUUID()
        
        await client.query(`
          INSERT INTO carts (id, "clerkUserId", "userEmail", "userName", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW(), NOW())
        `, [cartId, clerkUserId, `user-${clerkUserId}@temp.com`, `User ${clerkUserId.slice(-4)}`])
        
        cartResult = await client.query(`
          SELECT * FROM carts WHERE id = $1
        `, [cartId])
      }
      
      const cart = cartResult.rows[0]
      
      // Get cart items
      const itemsResult = await client.query(`
        SELECT ci.*, p.name as product_name, p.price, p.images
        FROM cart_items ci
        LEFT JOIN products p ON ci."productId" = p.id
        WHERE ci."cartId" = $1
      `, [cart.id])
      
      cart.items = itemsResult.rows
      
      client.release()
      await pool.end()
      
      return NextResponse.json({ cart })
      
    } catch (fallbackError) {
      console.error('Cart fallback error:', fallbackError)
      
      // Return detailed error in development, generic in production
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? `Failed to fetch cart: ${error instanceof Error ? error.message : 'Unknown error'}`
        : 'Failed to fetch cart'
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId: clerkUserId, productId, quantity = 1 } = body

    if (!clerkUserId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      )
    }

    const cartItem = await addToCart(clerkUserId, productId, quantity)
    return NextResponse.json({ cartItem }, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    
    // Return detailed error in development, generic in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`
      : 'Failed to add item to cart'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartItemId, quantity } = body

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Cart item ID and quantity are required' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      await db.cartItem.delete({
        where: { id: cartItemId }
      })
      return NextResponse.json({ message: 'Item removed from cart' })
    }

    // Get the cart item to access user and product info
    const existingCartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: true
      }
    })

    if (!existingCartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Get user info from Clerk
    const { userEmail, userName } = await getClerkUserInfo(existingCartItem.cart.clerkUserId)

    const cartItem = await db.cartItem.update({
      where: { id: cartItemId },
      data: { 
        quantity,
        productName: existingCartItem.product.name,
        userName,
        userEmail
      },
      include: {
        product: true
      }
    })

    return NextResponse.json({ cartItem })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get('cartItemId')
    const clerkUserId = searchParams.get('userId')

    if (cartItemId) {
      await db.cartItem.delete({
        where: { id: cartItemId }
      })
      return NextResponse.json({ message: 'Item removed from cart' })
    }

    if (clerkUserId) {
      await db.cartItem.deleteMany({
        where: {
          cart: {
            clerkUserId
          }
        }
      })
      return NextResponse.json({ message: 'Cart cleared' })
    }

    return NextResponse.json(
      { error: 'Cart item ID or User ID is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    )
  }
}