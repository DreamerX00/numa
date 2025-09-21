import type { Product, ProductVariant, CartItem } from '@/lib/types/product';

export interface CartOperationResult {
  success: boolean;
  error?: string;
  cartItem?: CartItem;
}

export interface CartSyncResult {
  success: boolean;
  error?: string;
  mergedItems?: CartItem[];
}

export class CartService {
  private static instance: CartService;
  
  // Server response shape for cart items
  private transformServerCartItem(raw: {
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    price: number;
    createdAt?: string;
    product: Product & { variants?: ProductVariant[] };
  }): CartItem {
    // Ensure product exists (API includes product on GET/POST/PUT paths we use)
    const product = raw.product;
    const variantId: string | null = raw.variantId ?? null;

    // Try to pick variant from included product.variants when present
    const variant = Array.isArray(product?.variants)
      ? (product.variants.find((v) => v.id === variantId) ?? null)
      : null;

    const mapped: CartItem = {
      id: raw.id,
      productId: raw.productId,
      variantId,
      quantity: raw.quantity,
      product,
      variant,
      addedAt: new Date(raw.createdAt ?? Date.now()),
      price: Number(raw.price ?? 0),
    };
    return mapped;
  }
  
  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  /**
   * Add item to cart - uses API for authenticated users, local storage for guests
   */
  async addToCart(
    product: Product, 
    variant: ProductVariant | null, 
    quantity: number = 1,
    isAuthenticated: boolean = false
  ): Promise<CartOperationResult> {
    try {
      if (isAuthenticated) {
        return await this.addToServerCart(product, variant, quantity);
      } else {
        return await this.addToLocalCart(product, variant, quantity);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add to cart' 
      };
    }
  }

  /**
   * Add item to server cart via API
   */
  private async addToServerCart(
    product: Product, 
    variant: ProductVariant | null, 
    quantity: number
  ): Promise<CartOperationResult> {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: variant?.id || null,
          quantity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }

      const data = await response.json();
      const raw = data.cartItem;
      // Prefer server-mapped item, but be resilient if product wasn't included
      if (raw && raw.product) {
        return {
          success: true,
          cartItem: this.transformServerCartItem(raw),
        };
      }
      // Fallback: construct from known inputs
      const fallback: CartItem = {
        id: raw?.id ?? `${product.id}-${variant?.id || 'main'}-${Date.now()}`,
        productId: product.id,
        variantId: variant?.id ?? null,
        quantity: raw?.quantity ?? quantity,
        product,
        variant: variant ?? null,
        addedAt: new Date(),
        price: Number(raw?.price ?? (variant?.price ?? product.price)),
      };
      return { success: true, cartItem: fallback };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add item to local cart (guest users)
   */
  private async addToLocalCart(
    product: Product, 
    variant: ProductVariant | null, 
    quantity: number
  ): Promise<CartOperationResult> {
    // Get cart from localStorage
    const cartData = localStorage.getItem('numa-cart');
    const cart = cartData ? JSON.parse(cartData) : { state: { items: [] } };
    
    const variantId = variant?.id || null;
    const existingItemIndex = cart.state.items.findIndex(
      (item: CartItem) => item.productId === product.id && item.variantId === variantId
    );

    const itemPrice = variant?.price || product.price;
    
    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.state.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `${product.id}-${variantId || 'main'}-${Date.now()}`,
        productId: product.id,
        variantId: variantId,
        quantity,
        product,
        variant,
        addedAt: new Date(),
        price: itemPrice,
      };
      cart.state.items.push(newItem);
    }

    // Save back to localStorage
    localStorage.setItem('numa-cart', JSON.stringify(cart));
    
    return { 
      success: true, 
      cartItem: cart.state.items[existingItemIndex] || cart.state.items[cart.state.items.length - 1]
    };
  }

  /**
   * Get cart items - from server for authenticated users, local for guests
   */
  async getCartItems(isAuthenticated: boolean = false): Promise<CartItem[]> {
    try {
      if (isAuthenticated) {
        return await this.getServerCartItems();
      } else {
        return this.getLocalCartItems();
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
  }

  /**
   * Get cart items from server
   */
  private async getServerCartItems(): Promise<CartItem[]> {
    try {
      const response = await fetch('/api/cart');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const data = await response.json();
      const items: Array<{
        id: string; productId: string; variantId: string | null; quantity: number; price: number; createdAt?: string; product: Product & { variants?: ProductVariant[] };
      }> = Array.isArray(data.items) ? data.items : [];
      return items.map((it) => this.transformServerCartItem(it));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get cart items from local storage
   */
  private getLocalCartItems(): CartItem[] {
    try {
      const cartData = localStorage.getItem('numa-cart');
      if (!cartData) return [];
      
      const cart = JSON.parse(cartData);
      return cart.state?.items || [];
    } catch (error) {
      console.error('Error reading local cart:', error);
      return [];
    }
  }

  /**
   * Sync local cart with server cart when user logs in
   */
  async syncCartOnLogin(): Promise<CartSyncResult> {
    try {
      // Get local cart items
      const localItems = this.getLocalCartItems();
      
      if (localItems.length === 0) {
        return { success: true, mergedItems: [] };
      }

      // Get server cart items (to check for conflicts, but for now just merge)
      await this.getServerCartItems();
      
      // Merge local items to server
      const syncPromises = localItems.map(async (localItem) => {
        return await this.addToServerCart(
          localItem.product, 
          localItem.variant, 
          localItem.quantity
        );
      });

      await Promise.all(syncPromises);
      
      // Clear local cart after successful sync
      this.clearLocalCart();
      
      // Get updated server cart
      const mergedItems = await this.getServerCartItems();
      
      return { 
        success: true, 
        mergedItems 
      };
    } catch (error) {
      console.error('Error syncing cart on login:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sync cart' 
      };
    }
  }

  /**
   * Move server cart to local storage when user logs out
   */
  async syncCartOnLogout(): Promise<CartSyncResult> {
    try {
      // Get server cart items
      const serverItems = await this.getServerCartItems();
      
      if (serverItems.length === 0) {
        return { success: true, mergedItems: [] };
      }

      // Save to local storage
      const cartData = {
        state: {
          items: serverItems
        }
      };
      
      localStorage.setItem('numa-cart', JSON.stringify(cartData));
      
      return { 
        success: true, 
        mergedItems: serverItems 
      };
    } catch (error) {
      console.error('Error syncing cart on logout:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sync cart' 
      };
    }
  }

  /**
   * Clear local cart
   */
  private clearLocalCart(): void {
    localStorage.removeItem('numa-cart');
  }

  /**
   * Update item quantity
   */
  async updateQuantity(
    itemId: string, 
    quantity: number, 
    isAuthenticated: boolean = false
  ): Promise<CartOperationResult> {
    try {
      if (isAuthenticated) {
        return await this.updateServerQuantity(itemId, quantity);
      } else {
        return await this.updateLocalQuantity(itemId, quantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update quantity' 
      };
    }
  }

  /**
   * Update quantity on server
   */
  private async updateServerQuantity(itemId: string, quantity: number): Promise<CartOperationResult> {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update quantity');
      }

      const data = await response.json();
      if (data.cartItem && data.cartItem.product) {
        return { success: true, cartItem: this.transformServerCartItem(data.cartItem) };
      }
      // If API doesn't include product, still report success; caller updates quantity optimistically
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update quantity in local storage
   */
  private async updateLocalQuantity(itemId: string, quantity: number): Promise<CartOperationResult> {
    const cartData = localStorage.getItem('numa-cart');
    if (!cartData) {
      throw new Error('Cart not found');
    }

    const cart = JSON.parse(cartData);
    const itemIndex = cart.state.items.findIndex((item: CartItem) => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }

    if (quantity <= 0) {
      // Remove item
      cart.state.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.state.items[itemIndex].quantity = quantity;
    }

    localStorage.setItem('numa-cart', JSON.stringify(cart));
    
    return { 
      success: true, 
      cartItem: cart.state.items[itemIndex] 
    };
  }

  /**
   * Remove item from cart
   */
  async removeItem(
    itemId: string, 
    isAuthenticated: boolean = false
  ): Promise<CartOperationResult> {
    try {
      if (isAuthenticated) {
        return await this.removeFromServerCart(itemId);
      } else {
        return await this.removeFromLocalCart(itemId);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove item' 
      };
    }
  }

  /**
   * Remove item from server cart
   */
  private async removeFromServerCart(itemId: string): Promise<CartOperationResult> {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove item');
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove item from local cart
   */
  private async removeFromLocalCart(itemId: string): Promise<CartOperationResult> {
    return await this.updateLocalQuantity(itemId, 0);
  }
}

// Export singleton instance
export const cartService = CartService.getInstance();