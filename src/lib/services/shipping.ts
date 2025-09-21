/**
 * Dynamic Shipping Service
 * Calculates shipping costs based on admin configuration
 */

import { prisma } from '@/lib/prisma';
import type { CartItem } from '@/lib/types/product';

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  available: boolean;
}

export interface ShippingCalculationResult {
  subtotal: number;
  methods: ShippingMethod[];
  selectedMethod?: ShippingMethod;
  totalWithShipping: number;
  qualifiesForFreeShipping: boolean;
  amountNeededForFreeShipping: number;
}

export interface UserLocation {
  country: string;
  state?: string;
  postalCode?: string;
}

interface ShippingConfig {
  freeShippingThreshold: number;
  standardRate: number;
  expeditedRate: number;
  sameDay: boolean;
  sameDayRate: number;
  sameDayMinOrder: number;
  internationalShipping: boolean;
  internationalRate: number;
  internationalProcessingTime: number;
  codEnabled: boolean;
  codCharges: number;
  codMaxAmount: number;
  freeShippingMethod: string;
  defaultProcessingTime: number;
}

class ShippingService {
  private static instance: ShippingService;
  private configCache: ShippingConfig | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ShippingService {
    if (!ShippingService.instance) {
      ShippingService.instance = new ShippingService();
    }
    return ShippingService.instance;
  }

  /**
   * Get shipping configuration from database with caching
   */
  async getShippingConfig(): Promise<ShippingConfig> {
    const now = Date.now();
    
    // Return cached config if still valid
    if (this.configCache && now < this.cacheExpiry) {
      return this.configCache;
    }

    try {
      // Fetch shipping settings from database
      const settings = await prisma.systemSetting.findMany({
        where: { category: 'shipping' },
        select: { key: true, value: true }
      });

      // Convert to config object using proper typing
      const config: Record<string, unknown> = {};
      settings.forEach(setting => {
        config[setting.key] = setting.value;
      });

      // Merge with defaults and cast to proper type
      const defaultConfig: ShippingConfig = {
        freeShippingThreshold: 500,
        standardRate: 50,
        expeditedRate: 150,
        sameDay: false,
        sameDayRate: 300,
        sameDayMinOrder: 1000,
        internationalShipping: false,
        internationalRate: 500,
        internationalProcessingTime: 7,
        codEnabled: true,
        codCharges: 25,
        codMaxAmount: 10000,
        freeShippingMethod: 'standard',
        defaultProcessingTime: 2,
      };

      this.configCache = { ...defaultConfig, ...config } as ShippingConfig;
      this.cacheExpiry = now + this.CACHE_DURATION;

      return this.configCache;
    } catch (error) {
      console.error('Failed to load shipping config:', error);
      
      // Return hardcoded defaults if database fails
      return {
        freeShippingThreshold: 500,
        standardRate: 50,
        expeditedRate: 150,
        sameDay: false,
        sameDayRate: 300,
        sameDayMinOrder: 1000,
        internationalShipping: false,
        internationalRate: 500,
        internationalProcessingTime: 7,
        codEnabled: true,
        codCharges: 25,
        codMaxAmount: 10000,
        freeShippingMethod: 'standard',
        defaultProcessingTime: 2,
      };
    }
  }

  /**
   * Calculate available shipping methods for cart
   */
  async calculateShipping(
    cartItems: CartItem[],
    userLocation: UserLocation,
    paymentMethod?: 'razorpay' | 'cod'
  ): Promise<ShippingCalculationResult> {
    const config = await this.getShippingConfig();
    
    // Calculate cart subtotal
    const subtotal = cartItems.reduce((total, item) => 
      total + (item.priceAtAdd * item.quantity), 0
    );

    const isInternational = userLocation.country !== 'IN';
    const methods: ShippingMethod[] = [];

    // Add standard shipping
    const standardMethod: ShippingMethod = {
      id: 'standard',
      name: 'Standard Shipping',
      description: `Delivery in ${config.defaultProcessingTime + 5}-${config.defaultProcessingTime + 7} business days`,
      price: isInternational ? config.internationalRate : config.standardRate,
      estimatedDays: `${config.defaultProcessingTime + 5}-${config.defaultProcessingTime + 7} days`,
      available: true,
    };

    // Apply free shipping if qualifies
    const qualifiesForFreeShipping = subtotal >= config.freeShippingThreshold;
    if (qualifiesForFreeShipping && config.freeShippingMethod === 'standard') {
      standardMethod.price = 0;
      standardMethod.name = 'Free Standard Shipping';
    }

    methods.push(standardMethod);

    // Add express shipping (domestic only)
    if (!isInternational) {
      const expressMethod: ShippingMethod = {
        id: 'express',
        name: 'Express Shipping',
        description: `Delivery in ${config.defaultProcessingTime + 2}-${config.defaultProcessingTime + 3} business days`,
        price: config.expeditedRate,
        estimatedDays: `${config.defaultProcessingTime + 2}-${config.defaultProcessingTime + 3} days`,
        available: true,
      };

      // Apply free shipping if qualifies
      if (qualifiesForFreeShipping && config.freeShippingMethod === 'express') {
        expressMethod.price = 0;
        expressMethod.name = 'Free Express Shipping';
      }

      methods.push(expressMethod);

      // Add same day delivery if enabled and meets minimum
      if (config.sameDay && subtotal >= config.sameDayMinOrder) {
        methods.push({
          id: 'same-day',
          name: 'Same Day Delivery',
          description: 'Delivery within 24 hours (local areas only)',
          price: config.sameDayRate,
          estimatedDays: 'Same day',
          available: true,
        });
      }
    }

    // Add COD charges if applicable
    if (paymentMethod === 'cod' && config.codEnabled && subtotal <= config.codMaxAmount) {
      methods.forEach(method => {
        if (method.price === 0) {
          method.price = config.codCharges;
          method.name = method.name.replace('Free ', '') + ' (COD)';
        } else {
          method.price += config.codCharges;
          method.name += ' (COD)';
        }
      });
    }

    // Select default method (cheapest available)
    const selectedMethod = methods.reduce((cheapest, current) => 
      current.price < cheapest.price ? current : cheapest
    );

    const totalWithShipping = subtotal + selectedMethod.price;
    const amountNeededForFreeShipping = qualifiesForFreeShipping 
      ? 0 
      : config.freeShippingThreshold - subtotal;

    return {
      subtotal,
      methods,
      selectedMethod,
      totalWithShipping,
      qualifiesForFreeShipping,
      amountNeededForFreeShipping,
    };
  }

  /**
   * Get specific shipping method by ID
   */
  async getShippingMethod(
    methodId: string,
    cartItems: CartItem[],
    userLocation: UserLocation,
    paymentMethod?: 'razorpay' | 'cod'
  ): Promise<ShippingMethod | null> {
    const result = await this.calculateShipping(cartItems, userLocation, paymentMethod);
    return result.methods.find(method => method.id === methodId) || null;
  }

  /**
   * Validate if shipping is available for location
   */
  async isShippingAvailable(userLocation: UserLocation): Promise<boolean> {
    const config = await this.getShippingConfig();
    
    // Check if international shipping is enabled for non-Indian addresses
    if (userLocation.country !== 'IN') {
      return config.internationalShipping;
    }

    return true; // Domestic shipping always available
  }

  /**
   * Get estimated processing time for order
   */
  async getProcessingTime(
    cartItems: CartItem[],
    userLocation: UserLocation
  ): Promise<number> {
    const config = await this.getShippingConfig();
    const isInternational = userLocation.country !== 'IN';
    
    return isInternational 
      ? config.internationalProcessingTime 
      : config.defaultProcessingTime;
  }

  /**
   * Clear configuration cache (useful after admin updates)
   */
  clearCache(): void {
    this.configCache = null;
    this.cacheExpiry = 0;
  }
}

// Export singleton instance
export const shippingService = ShippingService.getInstance();

// Legacy compatibility functions
export async function calculateShippingCost(
  orderTotal: number,
  userLocation?: UserLocation
): Promise<number> {
  const location = userLocation || { country: 'IN' };
  
  // Create mock cart items for legacy compatibility
  const mockCartItems: CartItem[] = [{
    id: 'mock',
    productId: 'mock',
    variantId: null,
    quantity: 1,
    priceAtAdd: orderTotal,
    addedAt: new Date(),
    product: { id: 'mock', name: 'Mock Product' } as CartItem['product'],
    variant: null,
  }];

  const result = await shippingService.calculateShipping(mockCartItems, location);
  return result.selectedMethod?.price || 0;
}

export async function qualifiesForFreeShipping(orderTotal: number): Promise<boolean> {
  const mockCartItems: CartItem[] = [{
    id: 'mock',
    productId: 'mock',
    variantId: null,
    quantity: 1,
    priceAtAdd: orderTotal,
    addedAt: new Date(),
    product: { id: 'mock', name: 'Mock Product' } as CartItem['product'],
    variant: null,
  }];

  const result = await shippingService.calculateShipping(mockCartItems, { country: 'IN' });
  return result.qualifiesForFreeShipping;
}

export async function amountNeededForFreeShipping(orderTotal: number): Promise<number> {
  const mockCartItems: CartItem[] = [{
    id: 'mock',
    productId: 'mock',
    variantId: null,
    quantity: 1,
    priceAtAdd: orderTotal,
    addedAt: new Date(),
    product: { id: 'mock', name: 'Mock Product' } as CartItem['product'],
    variant: null,
  }];

  const result = await shippingService.calculateShipping(mockCartItems, { country: 'IN' });
  return result.amountNeededForFreeShipping;
}