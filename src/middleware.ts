import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { checkDefaultRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

// Define protected routes
const protectedRoutes = {
  user: [
    '/dashboard',
    '/profile',
    '/user',
    '/api/user'
  ],
  admin: [
    '/admin',
    '/api/admin'
  ],
  auth: [
    '/login',
    '/register',
    '/auth'
  ]
};

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/api/health',
  '/_next',
  '/favicon.ico'
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

function isAuthRoute(pathname: string): boolean {
  return protectedRoutes.auth.some(route => pathname.startsWith(route));
}

function isUserRoute(pathname: string): boolean {
  return protectedRoutes.user.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return protectedRoutes.admin.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting to all requests
  const rateLimitResult = checkDefaultRateLimit(request);
  
  if (!rateLimitResult.allowed) {
    const headers = getRateLimitHeaders(rateLimitResult);
    
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers
      }
    );
  }

  // Get user session
  const session = await getSessionFromRequest(request);
  const isLoggedIn = session.isLoggedIn;
  const userRole = session.user?.role;

  // Handle public routes
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Add rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }

  // Handle auth routes (login, register)
  if (isAuthRoute(pathname)) {
    if (isLoggedIn) {
      // Redirect logged-in users away from auth pages
      const redirectUrl = userRole === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    
    const response = NextResponse.next();
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }

  // Handle protected routes
  if (!isLoggedIn) {
    // Redirect to login for unauthenticated users
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle admin routes
  if (isAdminRoute(pathname)) {
    if (userRole !== 'admin') {
      // Redirect non-admin users to their dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Handle user routes
  if (isUserRoute(pathname)) {
    // Allow both users and admins
    if (userRole !== 'user' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow access to protected route
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');  
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add HTTPS enforcement in production
  if (process.env.NODE_ENV === 'production' || process.env.FORCE_HTTPS === 'true') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Add rate limit headers
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Matcher configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
