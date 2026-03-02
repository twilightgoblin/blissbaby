import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes
const isProtectedRoute = createRouteMatcher(['/account', '/orders', '/profile'])

// Define protected API routes that require authentication
const isProtectedApiRoute = createRouteMatcher([
  '/api/user/(.*)',
])

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

// Define admin API routes that require admin role
const isAdminApiRoute = createRouteMatcher(['/api/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Protect page routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  
  // Protect API routes that require authentication
  if (isProtectedApiRoute(req)) {
    await auth.protect()
  }
  
  // Protect admin routes - require authentication first
  if (isAdminRoute(req) || isAdminApiRoute(req)) {
    const { userId } = await auth()
    
    if (!userId) {
      // For admin pages, redirect to home page where they can sign in via modal
      if (isAdminRoute(req)) {
        const homeUrl = new URL('/', req.url)
        homeUrl.searchParams.set('admin_redirect', req.nextUrl.pathname)
        return NextResponse.redirect(homeUrl)
      }
      // Return 401 for admin API routes
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For authenticated users, let the AdminAuthGuard component and API endpoints
    // handle the admin role verification to avoid Edge Runtime issues
  }
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}