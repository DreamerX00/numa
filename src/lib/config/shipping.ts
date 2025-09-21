/**
 * Shipping configuration
 * This should eventually be moved to database or admin panel
 */

export interface ShippingConfig {
  freeShippingThreshold: number; // Amount above which shipping is free
  standardShippingCost: number;  // Standard shipping cost
  currency: string;
}

// Default shipping configuration
// TODO: Move this to database/admin panel
export const defaultShippingConfig: ShippingConfig = {
  freeShippingThreshold: 500,  // Free shipping above ₹500
  standardShippingCost: 50,    // ₹50 standard shipping
  currency: 'INR'
};

/**
 * Calculate shipping cost based on order total
 */
export function calculateShippingCost(
  orderTotal: number, 
  config: ShippingConfig = defaultShippingConfig
): number {
  if (orderTotal >= config.freeShippingThreshold) {
    return 0; // Free shipping
  }
  return config.standardShippingCost;
}

/**
 * Check if order qualifies for free shipping
 */
export function qualifiesForFreeShipping(
  orderTotal: number,
  config: ShippingConfig = defaultShippingConfig
): boolean {
  return orderTotal >= config.freeShippingThreshold;
}

/**
 * Get amount needed for free shipping
 */
export function amountNeededForFreeShipping(
  orderTotal: number,
  config: ShippingConfig = defaultShippingConfig
): number {
  if (qualifiesForFreeShipping(orderTotal, config)) {
    return 0;
  }
  return config.freeShippingThreshold - orderTotal;
}