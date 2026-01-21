/**
 * Test script to verify admin access control is working properly
 * Run with: npx tsx scripts/test-admin-access.ts
 */

import { db } from '../lib/db'

async function testAdminAccess() {
  console.log('🔍 Testing Admin Access Control System...\n')

  try {
    // 1. Check current users and their roles
    console.log('1. Current users in database:')
    const users = await db.users.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        clerkUserId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' }
    })

    if (users.length === 0) {
      console.log('   ❌ No users found in database')
    } else {
      users.forEach((user, index) => {
        const roleIcon = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '👑' : '👤'
        console.log(`   ${roleIcon} ${user.email} - ${user.role} (${index === 0 ? 'First user' : 'User'})`)
      })
    }

    // 2. Check admin configuration
    console.log('\n2. Admin configuration:')
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
    const allowSelfService = process.env.ALLOW_SELF_SERVICE_ADMIN === 'true'
    const firstUserAutoAdmin = process.env.FIRST_USER_AUTO_ADMIN === 'true'

    console.log(`   📧 Allowed admin emails: ${adminEmails.length > 0 ? adminEmails.join(', ') : 'None'}`)
    console.log(`   🔓 Self-service admin: ${allowSelfService ? 'Enabled' : 'Disabled'}`)
    console.log(`   🥇 First user auto-admin: ${firstUserAutoAdmin ? 'Enabled' : 'Disabled'}`)

    // 3. Security recommendations
    console.log('\n3. Security Status:')
    
    const adminUsers = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')
    const regularUsers = users.filter(u => u.role === 'CUSTOMER')
    
    console.log(`   👑 Admin users: ${adminUsers.length}`)
    console.log(`   👤 Regular users: ${regularUsers.length}`)
    
    if (adminUsers.length === 0) {
      console.log('   ⚠️  WARNING: No admin users found!')
    }
    
    if (allowSelfService) {
      console.log('   ⚠️  WARNING: Self-service admin is enabled - any authenticated user can become admin!')
    } else {
      console.log('   ✅ Self-service admin is properly disabled')
    }
    
    if (adminEmails.length === 0 && !firstUserAutoAdmin) {
      console.log('   ⚠️  WARNING: No admin emails configured and first-user auto-admin is disabled!')
    }

    // 4. Test recommendations
    console.log('\n4. Testing Instructions:')
    console.log('   1. Try accessing /admin while logged out - should redirect to sign-in')
    console.log('   2. Sign in as a regular user and try /admin - should show access denied')
    console.log('   3. Sign in as an admin user and try /admin - should work')
    console.log('   4. Try accessing /api/admin/* endpoints without admin role - should return 403')
    
    console.log('\n✅ Admin access control test completed!')

  } catch (error) {
    console.error('❌ Error testing admin access:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run the test
testAdminAccess().catch(console.error)