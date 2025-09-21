import { NextResponse } from 'next/server';

export interface ApiErrorOptions {
  statusCode: number;
  message: string;
  details?: Record<string, unknown> | string | null;
  code?: string;
}

export interface StandardErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: Record<string, unknown> | string | null;
    timestamp: string;
    path?: string;
  };
}

/**
 * Creates a standardized API error response
 */
export function createErrorResponse(
  options: ApiErrorOptions,
  request?: Request
): NextResponse<StandardErrorResponse> {
  const { statusCode, message, details, code } = options;
  
  const errorResponse: StandardErrorResponse = {
    success: false,
    error: {
      message,
      code,
      statusCode,
      details,
      timestamp: new Date().toISOString(),
      path: request ? new URL(request.url).pathname : undefined,
    },
  };

  return NextResponse.json(errorResponse, { 
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store', // Don't cache error responses
    }
  });
}

/**
 * Pre-defined error response helpers
 */
export const ApiErrors = {
  badRequest: (message = 'Bad Request', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 400, message, details, code: 'BAD_REQUEST' }),

  unauthorized: (message = 'Unauthorized', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 401, message, details, code: 'UNAUTHORIZED' }),

  forbidden: (message = 'Access Forbidden', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 403, message, details, code: 'FORBIDDEN' }),

  notFound: (message = 'Resource Not Found', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 404, message, details, code: 'NOT_FOUND' }),

  methodNotAllowed: (message = 'Method Not Allowed', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 405, message, details, code: 'METHOD_NOT_ALLOWED' }),

  conflict: (message = 'Conflict', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 409, message, details, code: 'CONFLICT' }),

  unprocessableEntity: (message = 'Unprocessable Entity', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 422, message, details, code: 'UNPROCESSABLE_ENTITY' }),

  tooManyRequests: (message = 'Too Many Requests', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 429, message, details, code: 'TOO_MANY_REQUESTS' }),

  internalServerError: (message = 'Internal Server Error', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 500, message, details, code: 'INTERNAL_SERVER_ERROR' }),

  badGateway: (message = 'Bad Gateway', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 502, message, details, code: 'BAD_GATEWAY' }),

  serviceUnavailable: (message = 'Service Unavailable', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 503, message, details, code: 'SERVICE_UNAVAILABLE' }),

  gatewayTimeout: (message = 'Gateway Timeout', details?: Record<string, unknown> | string | null) =>
    createErrorResponse({ statusCode: 504, message, details, code: 'GATEWAY_TIMEOUT' }),
};

/**
 * Error handling wrapper for API route handlers
 */
export function withErrorHandling<T extends unknown[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse<R | StandardErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);
      
      // If it's already a standardized error response, return it
      if (error instanceof Response) {
        return error as NextResponse<StandardErrorResponse>;
      }

      // Handle different error types
      if (error instanceof Error) {
        // Check for specific error patterns
        const message = error.message.toLowerCase();
        
        if (message.includes('unauthorized') || message.includes('auth')) {
          return ApiErrors.unauthorized(error.message);
        }
        
        if (message.includes('forbidden') || message.includes('permission')) {
          return ApiErrors.forbidden(error.message);
        }
        
        if (message.includes('not found')) {
          return ApiErrors.notFound(error.message);
        }
        
        if (message.includes('validation') || message.includes('invalid')) {
          return ApiErrors.badRequest(error.message);
        }
        
        // Default to internal server error
        return ApiErrors.internalServerError(
          process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'An unexpected error occurred'
        );
      }
      
      // Fallback for unknown error types
      return ApiErrors.internalServerError('An unexpected error occurred');
    }
  };
}

/**
 * Validation error helper
 */
export function createValidationError(field: string, message: string) {
  return createErrorResponse({
    statusCode: 422,
    message: 'Validation Failed',
    details: { field, message },
    code: 'VALIDATION_ERROR'
  });
}

/**
 * Database error helper
 */
export function createDatabaseError(operation: string, error?: Error) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return createErrorResponse({
    statusCode: 500,
    message: `Database ${operation} failed`,
    details: isProduction ? undefined : error?.message,
    code: 'DATABASE_ERROR'
  });
}

/**
 * Authentication error helper
 */
export function createAuthenticationError(reason?: string) {
  return createErrorResponse({
    statusCode: 401,
    message: reason || 'Authentication required',
    code: 'AUTHENTICATION_ERROR'
  });
}

/**
 * Authorization error helper
 */
export function createAuthorizationError(resource?: string) {
  return createErrorResponse({
    statusCode: 403,
    message: resource 
      ? `You don't have permission to access ${resource}` 
      : 'Access denied',
    code: 'AUTHORIZATION_ERROR'
  });
}