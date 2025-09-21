# Global Error Handling System

This document describes the global error handling system implemented for the Numa e-commerce platform, which uses custom fallback images from the `/public/fallback/` folder to display user-friendly error pages.

## Overview

The error handling system provides:
- Custom error pages with fallback images for different HTTP status codes
- Consistent error response formatting for API routes
- Middleware-level error handling
- Client-side error boundaries for React components

## Components

### 1. Error Page Component (`src/components/ui/ErrorPage.tsx`)

A reusable React component that displays custom error pages with:
- Custom fallback images based on error codes
- Contextual error messages
- Action buttons (retry, go back, go home)
- Auto-refresh for service unavailable errors
- Responsive design with animations

**Usage:**
```tsx
import ErrorPage from "@/components/ui/ErrorPage";

<ErrorPage
  statusCode={404}
  title="Custom Title"
  message="Custom message"
  showRetry={true}
  showGoBack={true}
  showGoHome={true}
  onRetry={() => window.location.reload()}
/>
```

### 2. Next.js Error Boundaries

#### Global Error (`src/app/global-error.tsx`)
Catches unhandled errors across the entire application.

#### Route Error (`src/app/error.tsx`)
Catches errors within specific routes and their child components.

#### Admin Error (`src/app/admin/error.tsx`)
Specialized error handling for admin routes with appropriate messaging.

#### Not Found (`src/app/not-found.tsx`)
Handles 404 errors when pages don't exist.

### 3. Error Response Utilities (`src/lib/api/errors.ts`)

Standardized API error responses with:
- Consistent error format
- Pre-defined error helpers
- Error logging
- TypeScript types

**Usage:**
```ts
import { ApiErrors } from '@/lib/api/errors';

// In your API route
export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return ApiErrors.internalServerError('Something went wrong');
  }
}

// Or use specific error types
return ApiErrors.unauthorized('Login required');
return ApiErrors.forbidden('Access denied');
return ApiErrors.notFound('Resource not found');
```

### 4. Enhanced Middleware (`src/middleware.ts`)

Provides:
- Rate limiting
- Basic authentication checks
- Error handling for middleware failures
- Security headers

## Fallback Images

The system uses images from `/public/fallback/` for different error codes:

- `400.png` - Bad Request
- `401.png` - Unauthorized
- `403.png` - Forbidden
- `408.png` - Request Timeout
- `500.png` - Internal Server Error
- `502.png` - Bad Gateway
- `503.png` - Service Unavailable
- `504.png` - Gateway Timeout

**Note:** Currently missing `404.png` - uses `400.png` as fallback.

## Error Codes Supported

| Code | Type | Image | Description |
|------|------|-------|-------------|
| 400 | Bad Request | 400.png | Invalid request format |
| 401 | Unauthorized | 401.png | Authentication required |
| 403 | Forbidden | 403.png | Access denied |
| 404 | Not Found | 400.png* | Page not found |
| 408 | Request Timeout | 408.png | Request took too long |
| 429 | Too Many Requests | - | Rate limit exceeded |
| 500 | Internal Server Error | 500.png | Server error |
| 502 | Bad Gateway | 502.png | Gateway error |
| 503 | Service Unavailable | 503.png | Service down |
| 504 | Gateway Timeout | 504.png | Gateway timeout |

*Uses 400.png as fallback since 404.png doesn't exist

## API Error Response Format

All API errors follow this standardized format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": {},
    "timestamp": "2025-09-21T19:16:29.341Z",
    "path": "/api/endpoint"
  }
}
```

## Testing

### Test API Route (`/api/test-errors`)

A special API route for testing different error scenarios:

- `GET /api/test-errors` - Success response
- `GET /api/test-errors?error=unauthorized` - 401 error
- `GET /api/test-errors?error=forbidden` - 403 error
- `GET /api/test-errors?error=not-found` - 404 error
- `GET /api/test-errors?error=rate-limit` - 429 error
- `GET /api/test-errors?error=validation` - 422 error
- `GET /api/test-errors?error=server-error` - 500 error

### Manual Testing

1. **404 Error**: Visit any non-existent URL (e.g., `/non-existent-page`)
2. **500 Error**: Trigger a server error in any API route
3. **Client Error**: Throw an error in a React component
4. **Admin Error**: Access admin routes without proper permissions

## Implementation Guide

### For API Routes

1. Import the error utilities:
```ts
import { ApiErrors } from '@/lib/api/errors';
```

2. Replace manual error responses:
```ts
// Instead of:
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Use:
return ApiErrors.unauthorized('Login required');
```

3. Add try-catch blocks:
```ts
export async function GET(request: NextRequest) {
  try {
    // Your logic
  } catch (error) {
    console.error('API Error:', error);
    return ApiErrors.internalServerError();
  }
}
```

### For React Components

Use error boundaries to catch component errors:

```tsx
import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from '@/components/ui/ErrorPage';

<ErrorBoundary
  fallback={<ErrorPage statusCode={500} />}
  onError={(error) => console.error('Component error:', error)}
>
  <YourComponent />
</ErrorBoundary>
```

## Configuration

### Environment Variables

- `NODE_ENV`: Controls error detail visibility
  - `development`: Shows detailed error messages
  - `production`: Shows generic error messages

### Middleware Configuration

Rate limiting settings in `src/middleware.ts`:
- `RATE_LIMIT_WINDOW`: Time window (default: 60 seconds)
- `MAX_REQUESTS_PER_WINDOW`: Max requests per window (default: 100)

## Security Considerations

1. **Error Details**: Sensitive information is hidden in production
2. **Rate Limiting**: Prevents abuse and DDoS attacks  
3. **Logging**: All errors are logged for monitoring
4. **CORS**: Proper CORS handling for API requests

## Troubleshooting

### Common Issues

1. **Fallback images not loading**: 
   - Check if images exist in `/public/fallback/`
   - Verify image paths and file extensions

2. **Error pages not showing**:
   - Ensure error boundaries are properly placed
   - Check browser console for JavaScript errors

3. **API errors not formatted**:
   - Verify imports of error utilities
   - Check if routes are using try-catch blocks

### Debugging

Enable detailed error logging:
```ts
console.error('Detailed error:', {
  message: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
});
```

## Future Improvements

1. **Add missing fallback images**: Create 404.png and 429.png
2. **Error monitoring**: Integrate with services like Sentry
3. **Analytics**: Track error occurrences and patterns
4. **User feedback**: Allow users to report errors
5. **Retry mechanisms**: Smart retry logic for transient errors
6. **Error categorization**: Group similar errors for better handling