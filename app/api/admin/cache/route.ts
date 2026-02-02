import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAccess } from '@/lib/admin-auth'
import { CacheInvalidator } from '@/lib/cache-wrapper'
import CacheManager from '@/lib/redis'

export async function GET(request: NextRequest) {
  // Verify admin access
  const authResult = await requireAdminAccess()
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'stats':
        // Get cache statistics
        try {
          const cache = CacheManager
          // Get some sample keys to show cache status
          const productKeys = await cache.get('cache:stats:products') || 0
          const categoryKeys = await cache.get('cache:stats:categories') || 0
          const userKeys = await cache.get('cache:stats:users') || 0
          
          return NextResponse.json({
            status: 'connected',
            stats: {
              products: productKeys,
              categories: categoryKeys,
              users: userKeys
            }
          })
        } catch (error) {
          return NextResponse.json({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }

      default:
        return NextResponse.json({
          message: 'Cache management API',
          availableActions: ['stats', 'clear', 'invalidate']
        })
    }
  } catch (error) {
    console.error('Error in cache management:', error)
    return NextResponse.json(
      { error: 'Failed to manage cache' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Verify admin access
  const authResult = await requireAdminAccess()
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const body = await request.json()
    const { action, target, key } = body

    switch (action) {
      case 'clear':
        if (target === 'all') {
          await CacheInvalidator.clearAll()
          return NextResponse.json({ message: 'All caches cleared successfully' })
        }
        break

      case 'invalidate':
        switch (target) {
          case 'products':
            await CacheInvalidator.invalidateProduct(key || 'all')
            return NextResponse.json({ message: 'Product caches invalidated' })
          
          case 'categories':
            await CacheInvalidator.invalidateCategory(key || 'all')
            return NextResponse.json({ message: 'Category caches invalidated' })
          
          case 'users':
            if (key) {
              await CacheInvalidator.invalidateUser(key)
              return NextResponse.json({ message: `User cache invalidated for ${key}` })
            }
            break
          
          case 'orders':
            if (key) {
              await CacheInvalidator.invalidateOrder(key)
              return NextResponse.json({ message: `Order cache invalidated for ${key}` })
            }
            break
          
          case 'offers':
            await CacheInvalidator.invalidateOffers()
            return NextResponse.json({ message: 'Offer caches invalidated' })
          
          case 'admin':
            await CacheInvalidator.invalidateAdminStats()
            return NextResponse.json({ message: 'Admin stats caches invalidated' })
        }
        break

      case 'refresh':
        // Force refresh specific cache entries
        switch (target) {
          case 'categories':
            // This will refresh categories cache on next request
            await CacheInvalidator.invalidateCategory('all')
            return NextResponse.json({ message: 'Categories cache will refresh on next request' })
        }
        break
    }

    return NextResponse.json(
      { error: 'Invalid action or target' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in cache management:', error)
    return NextResponse.json(
      { error: 'Failed to manage cache' },
      { status: 500 }
    )
  }
}