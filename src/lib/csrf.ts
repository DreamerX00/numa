/**
 * CSRF Protection Utilities
 * 
 * Provides helper functions to handle CSRF tokens in client-side requests.
 * The middleware automatically sets a CSRF token cookie, and this utility
 * helps add the token to request headers for state-changing operations.
 */

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Get CSRF token from cookie
 */
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${CSRF_COOKIE_NAME}=`)
  );
  
  if (!csrfCookie) return null;
  
  return csrfCookie.split('=')[1];
}

/**
 * Add CSRF token to fetch request headers
 * 
 * Usage:
 * ```typescript
 * fetch('/api/example', {
 *   method: 'POST',
 *   headers: withCSRFToken({
 *     'Content-Type': 'application/json',
 *   }),
 *   body: JSON.stringify(data)
 * })
 * ```
 */
export function withCSRFToken(headers: HeadersInit = {}): HeadersInit {
  const csrfToken = getCSRFToken();
  
  if (!csrfToken) {
    console.warn('CSRF token not found - request may be rejected');
    return headers;
  }
  
  // Convert headers to object if needed
  const headersObj = headers instanceof Headers 
    ? Object.fromEntries(headers.entries())
    : Array.isArray(headers)
    ? Object.fromEntries(headers)
    : headers;
  
  return {
    ...headersObj,
    [CSRF_HEADER_NAME]: csrfToken,
  };
}

/**
 * Enhanced fetch wrapper with automatic CSRF token injection
 * for state-changing requests (POST, PUT, PATCH, DELETE)
 * 
 * Usage:
 * ```typescript
 * import { csrfFetch } from '@/lib/csrf';
 * 
 * const response = await csrfFetch('/api/example', {
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * });
 * ```
 */
export async function csrfFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = init?.method?.toUpperCase() || 'GET';
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  
  // Only add CSRF token for state-changing requests
  if (!safeMethods.includes(method)) {
    const headers = init?.headers || {};
    init = {
      ...init,
      headers: withCSRFToken(headers),
    };
  }
  
  return fetch(input, init);
}

/**
 * Check if CSRF token is present and valid format
 */
export function hasCSRFToken(): boolean {
  const token = getCSRFToken();
  return !!token && token.length > 0;
}

/**
 * Wait for CSRF token to be available (useful on page load)
 * Returns true if token is available, false if timeout
 */
export function waitForCSRFToken(timeoutMs: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    if (hasCSRFToken()) {
      resolve(true);
      return;
    }
    
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (hasCSRFToken()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
}
