/**
 * Currency and price formatting utilities
 */

export function formatPrice(cents: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency 
  }).format(cents / 100);
}

export function formatPriceFromFloat(price: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency 
  }).format(price);
}

export function convertToCents(price: number): number {
  return Math.round(price * 100);
}

export function convertFromCents(cents: number): number {
  return cents / 100;
}