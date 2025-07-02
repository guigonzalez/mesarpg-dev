import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase'

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareClient(request)

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/invite',
    '/reset-password',
    '/_next',
    '/favicon.ico',
    '/api'
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === '/'
  )

  // Routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/campanhas'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Handle authentication logic
  if (session) {
    // User is authenticated
    
    // Redirect authenticated users away from auth pages
    if (pathname === '/login' || pathname === '/') {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Allow access to protected routes
    if (isProtectedRoute) {
      return supabaseResponse
    }
  } else {
    // User is not authenticated
    
    // Allow access to public routes
    if (isPublicRoute) {
      return supabaseResponse
    }

    // Redirect unauthenticated users to login
    if (isProtectedRoute) {
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Default: allow the request to continue
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
