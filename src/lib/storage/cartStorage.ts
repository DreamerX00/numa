/**
 * LocalStorage abstraction for cart data
 * Provides type-safe access with error handling
 */

import type { CartItem } from '@/lib/types/product';

const CART_STORAGE_KEY = 'numa-cart';
const MAX_CART_ITEMS = 100; // Prevent excessive cart size

interface CartStorageData {
  state: {
    items: CartItem[];
  };
  version?: number; // For future migrations
}

export class CartStorage {
  private static instance: CartStorage;

  static getInstance(): CartStorage {
    if (!CartStorage.instance) {
      CartStorage.instance = new CartStorage();
    }
    return CartStorage.instance;
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get cart items from localStorage
   */
  getItems(): CartItem[] {
    if (!this.isAvailable()) {
      console.warn('localStorage not available');
      return [];
    }

    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      if (!data) return [];

      const parsed: CartStorageData = JSON.parse(data);
      
      // Validate structure
      if (!parsed.state || !Array.isArray(parsed.state.items)) {
        console.error('Invalid cart data structure');
        this.clear(); // Clear corrupted data
        return [];
      }

      return parsed.state.items;
    } catch (error) {
      console.error('Failed to read cart from localStorage:', error);
      // Clear corrupted data
      this.clear();
      return [];
    }
  }

  /**
   * Save cart items to localStorage
   */
  setItems(items: CartItem[]): boolean {
    if (!this.isAvailable()) {
      console.warn('localStorage not available');
      return false;
    }

    // Validate items count
    if (items.length > MAX_CART_ITEMS) {
      console.warn(`Cart exceeds maximum ${MAX_CART_ITEMS} items, truncating`);
      items = items.slice(0, MAX_CART_ITEMS);
    }

    try {
      const data: CartStorageData = {
        state: { items },
        version: 1
      };

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          console.error('localStorage quota exceeded');
          // Try to clear old data and retry with fewer items
          this.clear();
          
          if (items.length > 10) {
            console.warn('Attempting to save reduced cart (last 10 items)');
            const reducedItems = items.slice(-10);
            return this.setItems(reducedItems);
          }
        }
      }
      
      console.error('Failed to save cart to localStorage:', error);
      return false;
    }
  }

  /**
   * Add or update a single item
   */
  upsertItem(item: CartItem): boolean {
    const items = this.getItems();
    const existingIndex = items.findIndex(i => i.id === item.id);

    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }

    return this.setItems(items);
  }

  /**
   * Remove a single item
   */
  removeItem(itemId: string): boolean {
    const items = this.getItems();
    const filtered = items.filter(i => i.id !== itemId);
    return this.setItems(filtered);
  }

  /**
   * Update item quantity
   */
  updateQuantity(itemId: string, quantity: number): boolean {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    const items = this.getItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
      console.warn(`Item ${itemId} not found in cart`);
      return false;
    }

    item.quantity = quantity;
    return this.setItems(items);
  }

  /**
   * Clear all cart data
   */
  clear(): void {
    if (!this.isAvailable()) return;

    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cart from localStorage:', error);
    }
  }

  /**
   * Get cart statistics
   */
  getStats(): { itemCount: number; totalQuantity: number; storageSize: number } {
    const items = this.getItems();
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Estimate storage size
    let storageSize = 0;
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      storageSize = data ? new Blob([data]).size : 0;
    } catch {
      storageSize = 0;
    }

    return {
      itemCount: items.length,
      totalQuantity,
      storageSize
    };
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.getItems().length === 0;
  }

  /**
   * Get total cart value
   */
  getTotalValue(): number {
    const items = this.getItems();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}

// Export singleton instance
export const cartStorage = CartStorage.getInstance();
