import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function withSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://accounts.google.com https://checkout.razorpay.com https://widget.cloudinary.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://api.phonepe.com https://api-preprod.phonepe.com https://api.razorpay.com https://www.google-analytics.com https://*.googleapis.com https://accounts.google.com https://api.cloudinary.com https://res.cloudinary.com",
    "frame-src 'self' https://accounts.google.com https://api.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Set Content Security Policy
  response.headers.set("Content-Security-Policy", csp);

  // Additional security headers for API routes
  if (response.url?.includes("/api/")) {
    response.headers.set("X-Robots-Tag", "noindex");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  return response;
}

export function securityHeaders() {
  return {
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-XSS-Protection": "1; mode=block",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}

export function apiSecurityHeaders() {
  return {
    ...securityHeaders(),
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "X-Robots-Tag": "noindex",
  };
}

// Enhanced CORS handler
export function handleCORS(req: NextRequest): NextResponse | null {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });

    // Allow specific origins (configure based on your needs)
    const allowedOrigins = [
      "http://localhost:3000",
      "https://yourdomain.com", // Replace with your production domain
    ];

    const origin = req.headers.get("origin");
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "86400");

    return withSecurityHeaders(response);
  }

  return null;
}
