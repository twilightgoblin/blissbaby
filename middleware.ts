import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define protected routes (removed admin from protected routes)
const isProtectedRoute = createRouteMatcher(['/account', '/orders', '/profile'])

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  
  // Admin routes are now publicly accessible - no authentication required
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}