import { NextRequest, NextResponse } from 'next/server';
import { ApiErrors } from '@/lib/api/errors';

/**
 * Example API route demonstrating the use of custom error handling
 * This shows how your existing API routes can be updated to use the new error system
 */

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const testError = url.searchParams.get('error');

    // Example of different error scenarios
    switch (testError) {
      case 'unauthorized':
        return ApiErrors.unauthorized('You must be logged in to access this resource');
      
      case 'forbidden':
        return ApiErrors.forbidden('You do not have permission to perform this action');
      
      case 'not-found':
        return ApiErrors.notFound('The requested resource could not be found');
      
      case 'rate-limit':
        return ApiErrors.tooManyRequests('Rate limit exceeded. Please try again later');
      
      case 'validation':
        return ApiErrors.unprocessableEntity('Invalid input data', {
          field: 'email',
          message: 'Email address is required'
        });
      
      case 'server-error':
        // This will trigger the error boundary
        throw new Error('Simulated server error');
      
      default:
        // Successful response
        return NextResponse.json({
          success: true,
          message: 'Error handling system is working correctly',
          availableErrors: [
            'unauthorized',
            'forbidden', 
            'not-found',
            'rate-limit',
            'validation',
            'server-error'
          ]
        });
    }
  } catch (error) {
    console.error('Test API error:', error);
    return ApiErrors.internalServerError(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}

/*
Example usage:
- GET /api/test-errors                    -> Success response
- GET /api/test-errors?error=unauthorized -> 401 error with custom fallback image
- GET /api/test-errors?error=forbidden    -> 403 error with custom fallback image
- GET /api/test-errors?error=not-found    -> 404 error with custom fallback image
- GET /api/test-errors?error=server-error -> 500 error with custom fallback image
*/