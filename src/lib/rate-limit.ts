import { NextRequest, NextResponse } from 'next/server';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts in the window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitData>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxAttempts,
    keyGenerator = (req: NextRequest) => getClientIP(req),
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (req: NextRequest, handler: () => Promise<NextResponse>) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const resetTime = now + windowMs;

    // Get or create rate limit data
    let rateLimitData = rateLimitStore.get(key);
    
    if (!rateLimitData || now > rateLimitData.resetTime) {
      // Reset or create new entry
      rateLimitData = { count: 0, resetTime };
      rateLimitStore.set(key, rateLimitData);
    }

    // Check if rate limit exceeded
    if (rateLimitData.count >= maxAttempts) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxAttempts.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitData.resetTime / 1000).toString(),
            'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000).toString()
          }
        }
      );
    }

    // Increment counter (before processing request)
    if (!skipFailedRequests) {
      rateLimitData.count++;
    }

    // Process the request
    const response = await handler();

    // Handle successful/failed request counting
    if (response.status >= 400 && skipFailedRequests) {
      // Don't count failed requests
      rateLimitData.count--;
    } else if (response.status < 400 && skipSuccessfulRequests) {
      // Don't count successful requests
      rateLimitData.count--;
    }

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', maxAttempts.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, maxAttempts - rateLimitData.count).toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitData.resetTime / 1000).toString());

    return response;
  };
}

// Utility function to get client IP
function getClientIP(req: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback - in production, this would be handled by your hosting provider
  return 'unknown';
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Strict rate limiting for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true, // Only count failed login attempts
  },
  
  // Moderate rate limiting for payment endpoints
  payment: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 10, // 10 payment attempts per minute
  },
  
  // General API rate limiting
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 100, // 100 requests per minute
  },
  
  // Strict rate limiting for admin endpoints
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 50, // 50 admin requests per minute
  },
};

// Enhanced rate limiter for authentication with user-specific tracking
export function authRateLimit() {
  return rateLimit({
    ...rateLimitConfigs.auth,
    keyGenerator: (req: NextRequest) => {
      // Combine IP and email for more precise tracking
      const ip = getClientIP(req);
      const body = req.body ? JSON.stringify(req.body) : '';
      const email = body.includes('email') ? 
        JSON.parse(body).email?.toLowerCase() || '' : '';
      return `auth:${ip}:${email}`;
    },
  });
}

export { getClientIP };