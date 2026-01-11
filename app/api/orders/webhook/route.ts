import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendNotificationToMultipleUsers } from '@/lib/firebase-admin'

// POST /api/orders/webhook - Called when a new order is created
export async function POST(request: NextRequest) {
  try {
    const { orderId, orderNumber, totalAmount, currency, userEmail } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get all admin users with FCM tokens
    const adminUsers = await db.users.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        fcmToken: { not: null },
        notificationEnabled: true,
      },
      select: {
        fcmToken: true,
        email: true,
      },
    })

    if (adminUsers.length > 0) {
      const tokens = adminUsers.map(user => user.fcmToken).filter(Boolean)
      
      // Send notification to admins
      const result = await sendNotificationToMultipleUsers(
        tokens,
        '🛒 New Order Received',
        `Order ${orderNumber} for ${currency} ${totalAmount} from ${userEmail}`,
        {
          type: 'new_order',
          orderId,
          orderNumber,
          url: `/admin/orders`,
        }
      )

      console.log(`Notified ${result.successCount} admins about new order ${orderNumber}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Order webhook processed successfully',
      notifiedAdmins: adminUsers.length,
    })
  } catch (error) {
    console.error('Error processing order webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process order webhook' },
      { status: 500 }
    )
  }
}