import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define protected routes
const isProtectedRoute = createRouteMatcher(['/account', '/orders', '/profile'])

// Define protected API routes that require authentication
const isProtectedApiRoute = createRouteMatcher([
  '/api/user/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Protect page routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  
  // Protect API routes that require authentication
  if (isProtectedApiRoute(req)) {
    await auth.protect()
  }
  
  // Admin routes are now publicly accessible - no authentication required
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