import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  const isLoginPage = pathname === '/login'
  const isDashboardPage = pathname === '/dashboard'

  const protectedApiRoutes = [
    '/api/users/dashboard',
    '/api/users/logout',
    '/api/users/me',
    '/api/users/tasks',
  ]

  const isProtectedApi = protectedApiRoutes.includes(pathname)

  // If logged in and trying to access /login page, redirect to /dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If not logged in and trying to access dashboard page or protected APIs
  if (!token && (isDashboardPage || isProtectedApi)) {
    // For API calls return 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For pages, redirect to /login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard',
    '/login',
    '/api/users/dashboard',
    '/api/users/logout',
    '/api/users/me',
    '/api/users/tasks',
  ],
}
