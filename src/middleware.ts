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

// NextAuth session cookie name
const NEXTAUTH_SESSION_COOKIE = process.env.NODE_ENV === 'production' 
  ? '__Secure-next-auth.session-token' 
  : 'next-auth.session-token';

// CSRF protection configuration
const CSRF_SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_COOKIE = 'csrf-token';

// Check if user has valid NextAuth session
function hasValidSession(request: NextRequest): boolean {
  // Check NextAuth session
  const nextAuthSession = request.cookies.get(NEXTAUTH_SESSION_COOKIE);
  if (nextAuthSession?.value) {
    return true; // NextAuth sessions are validated by NextAuth middleware
  }
  
  return false;
}

// Generate CSRF token
function generateCSRFToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate CSRF token for state-changing requests
function validateCSRF(request: NextRequest): boolean {
  // Skip CSRF validation for safe methods
  if (CSRF_SAFE_METHODS.includes(request.method)) {
    return true;
  }
  
  // Skip CSRF validation for API routes (they should handle CSRF separately if needed)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return true;
  }
  
  // Get CSRF token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  // Get CSRF token from cookie
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;
  
  // Both must exist and match
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return false;
  }
  
  return true;
}

// Enhanced error handling function
function createErrorResponse(request: NextRequest, statusCode: number, reason?: string): NextResponse {
  const url = new URL(`/error?code=${statusCode}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`, request.url);
  
  const response = NextResponse.rewrite(url, { status: statusCode });
  return withSecurityHeaders(response);
}

// Rate limiting check (enhanced implementation)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

// Cleanup old entries periodically to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitMap.entries()) {
      if (now - data.lastReset > RATE_LIMIT_WINDOW * 2) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }
  
  // Reset window if expired
  if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }
  
  // Check if limit exceeded
  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    console.warn(`Rate limit exceeded for IP: ${ip}`);
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

    // CSRF validation for state-changing requests
    if (!validateCSRF(request)) {
      console.warn(`CSRF validation failed for ${request.method} ${pathname}`);
      return createErrorResponse(request, 403, 'CSRF validation failed');
    }

    // Check if user has a valid session (Firebase or NextAuth)
    const hasSession = hasValidSession(request);

    // Handle protected routes (excluding admin routes which are handled client-side)
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !adminRoutes.some(route => pathname.startsWith(route))) {
      if (!hasSession) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Handle auth routes (login/signup)
    if (authRoutes.some(route => pathname.startsWith(route))) {
      if (hasSession) {
        const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }

    // Apply security headers to response
    const response = NextResponse.next();
    const secureResponse = withSecurityHeaders(response);
    
    // Set CSRF token cookie if not present
    if (!request.cookies.get(CSRF_TOKEN_COOKIE)) {
      const csrfToken = generateCSRFToken();
      secureResponse.cookies.set(CSRF_TOKEN_COOKIE, csrfToken, {
        httpOnly: false, // Must be accessible to JavaScript for header setting
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      });
    }
    
    return secureResponse;
    
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