import { db } from '../lib/db'
import { sendNotificationToMultipleUsers } from '../lib/firebase-admin'

async function testNotifications() {
  try {
    console.log('🧪 Testing FCM Notification System...')

    // Get all users with FCM tokens
    const users = await db.users.findMany({
      where: {
        fcmToken: { not: null },
        notificationEnabled: true,
      },
      select: {
        id: true,
        email: true,
        fcmToken: true,
      },
    })

    console.log(`📱 Found ${users.length} users with FCM tokens`)

    if (users.length === 0) {
      console.log('❌ No users found with FCM tokens. Please enable notifications in the app first.')
      return
    }

    const tokens = users.map(user => user.fcmToken).filter(Boolean)

    // Test notification
    const result = await sendNotificationToMultipleUsers(
      tokens,
      '🧪 Test Notification',
      'This is a test notification from BabyBliss! Your FCM setup is working correctly.',
      {
        type: 'test',
        timestamp: new Date().toISOString(),
        url: '/profile/notifications',
      }
    )

    console.log('📊 Notification Results:')
    console.log(`✅ Success: ${result.successCount}`)
    console.log(`❌ Failed: ${result.failureCount}`)

    if (result.failureCount > 0) {
      console.log('Failed responses:', result.responses?.filter(r => !r.success))
    }

    console.log('✅ Test completed!')
  } catch (error) {
    console.error('❌ Error testing notifications:', error)
  } finally {
    await db.$disconnect()
  }
}

testNotifications()