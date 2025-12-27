import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateCart, addToCart } from '@/lib/db-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const cart = await getOrCreateCart(userId)
    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, quantity = 1 } = body

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      )
    }

    const cartItem = await addToCart(userId, productId, quantity)
    return NextResponse.json({ cartItem }, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
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
        cart: {
          include: {
            user: true
          }
        },
        product: true
      }
    })

    if (!existingCartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    const cartItem = await db.cartItem.update({
      where: { id: cartItemId },
      data: { 
        quantity,
        productName: existingCartItem.product.name,
        userName: existingCartItem.cart.user.name,
        userEmail: existingCartItem.cart.user.email
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
    const userId = searchParams.get('userId')

    if (cartItemId) {
      await db.cartItem.delete({
        where: { id: cartItemId }
      })
      return NextResponse.json({ message: 'Item removed from cart' })
    }

    if (userId) {
      await db.cartItem.deleteMany({
        where: {
          cart: {
            userId
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