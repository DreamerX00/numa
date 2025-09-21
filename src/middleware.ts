import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withSecurityHeaders, handleCORS } from '@/lib/security-headers';

// Define protected routes that require authentication
// Note: /profile and /admin are handled by client-side components due to session timing
const protectedRoutes = ['/orders', '/wishlist', '/account'];

// Define auth routes that should redirect if user is already logged in
const authRoutes = ['/login', '/signup'];

// Admin routes that require special handling (handled client-side)
const adminRoutes = ['/admin'];

// Session cookie name (matching the one set in login API)
const SESSION_COOKIE_NAME = '__session';

// Basic session validation without full Firebase verification
// (to avoid Edge Runtime incompatibility)
function isValidSessionFormat(sessionCookie: string): boolean {
  try {
    // Basic checks for session cookie format
    if (!sessionCookie || sessionCookie.length < 10) return false;
    
    // Check if it looks like a JWT (has proper structure)
    const parts = sessionCookie.split('.');
    if (parts.length !== 3) return false;
    
    // Basic base64 validation for JWT header
    try {
      const header = JSON.parse(atob(parts[0]));
      return header.alg && header.typ;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

// Enhanced error handling function
function createErrorResponse(request: NextRequest, statusCode: number, reason?: string): NextResponse {
  const url = new URL(`/error?code=${statusCode}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`, request.url);
  
  const response = NextResponse.rewrite(url, { status: statusCode });
  return withSecurityHeaders(response);
}

// Rate limiting check (basic implementation)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }
  
  if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }
  
  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  userLimit.count++;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  try {
    // Handle CORS preflight requests
    const corsResponse = handleCORS(request);
    if (corsResponse) {
      return corsResponse;
    }

    // Basic rate limiting
    const ip = request.headers.get('X-Forwarded-For') ?? request.headers.get('X-Real-IP') ?? 'unknown';
    if (isRateLimited(ip)) {
      return createErrorResponse(request, 429, 'Too many requests');
    }

    // Check if user has a valid session cookie format
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const hasValidSessionFormat = sessionCookie?.value ? isValidSessionFormat(sessionCookie.value) : false;

    // Handle protected routes (excluding admin routes which are handled client-side)
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !adminRoutes.some(route => pathname.startsWith(route))) {
      if (!hasValidSessionFormat) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Handle auth routes (login/signup)
    if (authRoutes.some(route => pathname.startsWith(route))) {
      if (hasValidSessionFormat) {
        const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }

    // Apply security headers to response
    const response = NextResponse.next();
    return withSecurityHeaders(response);
    
  } catch (error) {
    console.error('Middleware error:', error);
    // Return a 500 error response if middleware fails
    return createErrorResponse(request, 500, 'Internal middleware error');
  }
}

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
    '/((?!api|_next/static|_next/image|favicon.ico|public|numaLogo.png).*)',
  ],
};