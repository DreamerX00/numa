/**
 * Utility functions for handling date conversions safely
 */

/**
 * Safely converts a date to ISO string
 * Handles both Date objects and string dates
 */
export function toISOStringSafe(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  
  if (date instanceof Date) {
    return date.toISOString();
  }
  
  // Fallback for any other type
  return new Date().toISOString();
}

/**
 * Safely converts a date to string
 * Handles both Date objects and string dates
 */
export function toStringSafe(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  
  if (date instanceof Date) {
    return date.toString();
  }
  
  // Fallback for any other type
  return new Date().toString();
}

/**
 * Safely converts product dates for cart operations
 * Ensures dates are strings for serialization
 */
export function sanitizeProductDates<T extends { createdAt: Date | string; updatedAt: Date | string }>(
  product: T
): Omit<T, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string } {
  return {
    ...product,
    createdAt: toISOStringSafe(product.createdAt),
    updatedAt: toISOStringSafe(product.updatedAt),
  };
}