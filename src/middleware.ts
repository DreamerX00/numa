import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withSecurityHeaders, handleCORS } from "@/lib/security-headers";

// Define protected routes that require authentication
const protectedRoutes = ["/orders", "/wishlist", "/account"];

// NextAuth session cookie name (environment-aware)
const NEXTAUTH_SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

// CSRF protection configuration
const CSRF_SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_TOKEN_COOKIE = "csrf-token";

// Check if user has valid NextAuth session
function hasValidSession(request: NextRequest): boolean {
  return !!request.cookies.get(NEXTAUTH_SESSION_COOKIE)?.value;
}

// Generate CSRF token
function generateCSRFToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

// Validate CSRF token for state-changing requests
function validateCSRF(request: NextRequest): boolean {
  // Skip CSRF validation for safe methods
  if (CSRF_SAFE_METHODS.has(request.method)) {
    return true;
  }

  // Skip CSRF validation for API routes (they handle CSRF separately if needed)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return true;
  }

  // Get CSRF token from header and cookie
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;

  // Both must exist and match
  return !!(headerToken && cookieToken && headerToken === cookieToken);
}

// Enhanced error handling function
function createErrorResponse(
  request: NextRequest,
  statusCode: number,
  reason?: string
): NextResponse {
  const url = new URL(
    `/error?code=${statusCode}${reason ? `&reason=${encodeURIComponent(reason)}` : ""}`,
    request.url
  );
  return withSecurityHeaders(NextResponse.rewrite(url, { status: statusCode }));
}

// Rate limiting configuration
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const CLEANUP_THRESHOLD = RATE_LIMIT_WINDOW * 2;

// Cleanup old entries periodically to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitMap.entries()) {
      if (now - data.lastReset > CLEANUP_THRESHOLD) {
        rateLimitMap.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    // Create new or reset expired limit
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
    // 1. Handle CORS preflight requests
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    // 2. Rate limiting
    const ip =
      request.headers.get("X-Forwarded-For") ??
      request.headers.get("X-Real-IP") ??
      "unknown";
    if (isRateLimited(ip)) {
      return createErrorResponse(request, 429, "Too many requests");
    }

    // 3. CSRF validation
    if (!validateCSRF(request)) {
      console.warn(`CSRF validation failed for ${request.method} ${pathname}`);
      return createErrorResponse(request, 403, "CSRF validation failed");
    }

    // 4. Session check
    const hasSession = hasValidSession(request);

    // 5. Protected routes handling
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );
    if (isProtectedRoute && !hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 6. Auth routes - Allow access even when logged in (removed redirect)
    // Users can visit /login and /signup regardless of authentication status
    // The pages themselves will handle showing appropriate UI

    // 7. Apply security headers and CSRF token
    const response = withSecurityHeaders(NextResponse.next());

    // Set CSRF token cookie if not present
    if (!request.cookies.has(CSRF_TOKEN_COOKIE)) {
      const csrfToken = generateCSRFToken();
      response.cookies.set(CSRF_TOKEN_COOKIE, csrfToken, {
        httpOnly: false, // Must be accessible to JavaScript
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return createErrorResponse(request, 500, "Internal middleware error");
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
    "/((?!api|_next/static|_next/image|favicon.ico|public|numaLogo.png).*)",
  ],
};
