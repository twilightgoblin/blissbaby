import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const orders = await db.order.findMany({
      where: { clerkUserId: userId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        payments: true,
        shippingAddress: true,
        billingAddress: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Try to get user ID from Clerk, but don't fail if not available
    let userId = null
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (authError) {
      // Auth failed, continue as guest user
      console.log('Auth not available, continuing as guest user')
    }
    
    const body = await request.json()
    
    const {
      clerkUserId,
      userEmail,
      userName,
      cartItems,
      shippingAddress,
      billingAddress,
      paymentIntentId,
      subtotal,
      taxAmount,
      shippingAmount,
      totalAmount,
      currency = 'INR'
    } = body

    // Validate required fields
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      )
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    // Validate amount calculations
    const calculatedSubtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0
    );
    
    const calculatedTotal = calculatedSubtotal + parseFloat(taxAmount.toString()) + parseFloat(shippingAmount.toString());
    
    // Allow small floating point differences (within 0.01)
    if (Math.abs(calculatedSubtotal - parseFloat(subtotal.toString())) > 0.01) {
      console.error('Subtotal mismatch:', { calculatedSubtotal, providedSubtotal: subtotal });
      return NextResponse.json(
        { error: 'Subtotal calculation mismatch' },
        { status: 400 }
      )
    }
    
    if (Math.abs(calculatedTotal - parseFloat(totalAmount.toString())) > 0.01) {
      console.error('Total amount mismatch:', { calculatedTotal, providedTotal: totalAmount });
      return NextResponse.json(
        { error: 'Total amount calculation mismatch' },
        { status: 400 }
      )
    }

    // Use the provided clerkUserId or fallback to the auth userId or 'guest'
    const finalUserId = clerkUserId || userId || 'guest'

    // Generate unique order number
    const orderNumber = `BB-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create order in a transaction
    const order = await db.$transaction(async (tx) => {
      // Create shipping address if provided
      let shippingAddressId = null
      if (shippingAddress) {
        const createdShippingAddress = await tx.address.create({
          data: {
            clerkUserId: finalUserId,
            userEmail,
            userName,
            type: 'SHIPPING',
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            company: shippingAddress.company || '',
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2 || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country || 'IN',
            phone: shippingAddress.phone || '',
          }
        })
        shippingAddressId = createdShippingAddress.id
      }

      // Create billing address if provided and different from shipping
      let billingAddressId = shippingAddressId
      if (billingAddress && billingAddress !== shippingAddress) {
        const createdBillingAddress = await tx.address.create({
          data: {
            clerkUserId: finalUserId,
            userEmail,
            userName,
            type: 'BILLING',
            firstName: billingAddress.firstName,
            lastName: billingAddress.lastName,
            company: billingAddress.company || '',
            addressLine1: billingAddress.addressLine1,
            addressLine2: billingAddress.addressLine2 || '',
            city: billingAddress.city,
            state: billingAddress.state,
            postalCode: billingAddress.postalCode,
            country: billingAddress.country || 'IN',
            phone: billingAddress.phone || '',
          }
        })
        billingAddressId = createdBillingAddress.id
      }

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          clerkUserId: finalUserId,
          userEmail,
          userName,
          orderNumber,
          status: 'PENDING',
          subtotal: parseFloat(subtotal.toString()),
          taxAmount: parseFloat(taxAmount.toString()),
          shippingAmount: parseFloat(shippingAmount.toString()),
          totalAmount: parseFloat(totalAmount.toString()),
          currency,
          shippingAddressId,
          billingAddressId,
        }
      })

      // Create order items
      const orderItems = await Promise.all(
        cartItems.map((item: any) =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: parseFloat(item.unitPrice.toString()),
              totalPrice: parseFloat((item.unitPrice * item.quantity).toString()),
            }
          })
        )
      )

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId: newOrder.id,
          userEmail,
          userName,
          amount: parseFloat(totalAmount.toString()),
          currency,
          status: 'COMPLETED',
          method: 'CREDIT_CARD',
          provider: 'stripe',
          providerPaymentId: paymentIntentId,
          processedAt: new Date(),
        }
      })

      return {
        ...newOrder,
        items: orderItems,
        payment,
        shippingAddress: shippingAddressId ? await tx.address.findUnique({ where: { id: shippingAddressId } }) : null,
        billingAddress: billingAddressId ? await tx.address.findUnique({ where: { id: billingAddressId } }) : null,
      }
    })

    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Order created successfully' 
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}