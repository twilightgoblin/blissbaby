import { db } from './db'
import { ProductStatus, OrderStatus, PaymentStatus } from './generated/prisma'
import { currentUser } from '@clerk/nextjs/server'

// Utility function to get user email and name from Clerk
export const getClerkUserInfo = async (clerkUserId: string) => {
  try {
    const user = await currentUser()
    if (user && user.id === clerkUserId) {
      return {
        userEmail: user.primaryEmailAddress?.emailAddress || '',
        userName: user.fullName || user.firstName || null
      }
    }
    return {
      userEmail: '',
      userName: null
    }
  } catch (error) {
    console.error('Error fetching Clerk user info:', error)
    return {
      userEmail: '',
      userName: null
    }
  }
}

// User helpers - removed since using Clerk directly

// Product helpers
export const createProduct = async (data: {
  name: string
  description?: string
  price: number
  category: string
  brand?: string
  images?: string[]
  inventory?: number
  sku?: string
}) => {
  return await db.product.create({
    data: {
      ...data,
      price: data.price,
      status: ProductStatus.ACTIVE,
      inventory: data.inventory || 0,
      images: data.images || []
    }
  })
}

export const getActiveProducts = async (limit?: number) => {
  return await db.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      inventory: {
        gt: 0
      }
    },
    take: limit,
    orderBy: {
      createdAt: 'desc'
    }
  })
}

// Cart helpers
export const getOrCreateCart = async (clerkUserId: string) => {
  let cart = await db.cart.findFirst({
    where: { clerkUserId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    }
  })

  if (!cart) {
    const { userEmail, userName } = await getClerkUserInfo(clerkUserId)
    cart = await db.cart.create({
      data: { 
        clerkUserId,
        userEmail,
        userName
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })
  }

  return cart
}

export const addToCart = async (clerkUserId: string, productId: string, quantity: number = 1) => {
  const cart = await getOrCreateCart(clerkUserId)
  const { userEmail, userName } = await getClerkUserInfo(clerkUserId)
  
  // Get product info
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { name: true }
  })
  
  const existingItem = await db.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId
      }
    }
  })

  if (existingItem) {
    return await db.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
        productName: product?.name,
        userName,
        userEmail
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })
  } else {
    return await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        productName: product?.name,
        userName,
        userEmail
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })
  }
}

// Order helpers
export const createOrder = async (data: {
  clerkUserId: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
  }>
  shippingAddressId?: string
  billingAddressId?: string
  subtotal: number
  taxAmount?: number
  shippingAmount?: number
  discountAmount?: number
}) => {
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  const { userEmail, userName } = await getClerkUserInfo(data.clerkUserId)
  
  const totalAmount = data.subtotal + (data.taxAmount || 0) + (data.shippingAmount || 0) - (data.discountAmount || 0)

  return await db.order.create({
    data: {
      clerkUserId: data.clerkUserId,
      userEmail,
      userName,
      orderNumber,
      status: OrderStatus.PENDING,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount || 0,
      shippingAmount: data.shippingAmount || 0,
      discountAmount: data.discountAmount || 0,
      totalAmount,
      shippingAddressId: data.shippingAddressId,
      billingAddressId: data.billingAddressId,
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity
        }))
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      },
      shippingAddress: true,
      billingAddress: true
    }
  })
}

export const getUserOrders = async (clerkUserId: string) => {
  return await db.order.findMany({
    where: { clerkUserId },
    include: {
      items: {
        include: {
          product: true
        }
      },
      payments: true,
      shipments: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

// Payment helpers
export const createPayment = async (data: {
  orderId: string
  amount: number
  method: string
  provider?: string
  providerPaymentId?: string
}) => {
  // Get user info from the order
  const order = await db.order.findUnique({
    where: { id: data.orderId },
    select: { clerkUserId: true }
  })
  
  if (!order) {
    throw new Error('Order not found')
  }
  
  const { userEmail, userName } = await getClerkUserInfo(order.clerkUserId)
  
  return await db.payment.create({
    data: {
      ...data,
      userEmail,
      userName,
      status: PaymentStatus.PENDING,
      method: data.method as any
    }
  })
}

// Address helpers
export const createAddress = async (data: {
  clerkUserId: string
  firstName: string
  lastName: string
  addressLine1: string
  city: string
  state: string
  postalCode: string
  country?: string
  phone?: string
  isDefault?: boolean
}) => {
  const { userEmail, userName } = await getClerkUserInfo(data.clerkUserId)
  
  return await db.address.create({
    data: {
      ...data,
      userEmail,
      userName,
      country: data.country || 'US'
    }
  })
}

// Refund helpers
export const createRefund = async (data: {
  orderId: string
  paymentId?: string
  amount: number
  reason: string
  description?: string
}) => {
  // Get user info from the order
  const order = await db.order.findUnique({
    where: { id: data.orderId },
    select: { clerkUserId: true }
  })
  
  if (!order) {
    throw new Error('Order not found')
  }
  
  const { userEmail, userName } = await getClerkUserInfo(order.clerkUserId)
  
  return await db.refund.create({
    data: {
      ...data,
      userEmail,
      userName,
      reason: data.reason as any
    }
  })
}