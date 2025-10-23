"use client";

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/client';
import { cartService, type CartOperationResult } from '@/lib/services/cart';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '@/lib/types/product';
import { useHybridCartStore } from '@/lib/store/hybridCart';

export function useCartService() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [operation, setOperation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  // Using store via getState() to avoid unnecessary re-renders here

  const isAuthenticated = !!user;

  const addToCart = useCallback(async (
    product: Product, 
    variant: ProductVariant | null = null, 
    quantity: number = 1
  ): Promise<CartOperationResult> => {
    setIsLoading(true);
    setOperation('adding');
    setError(null);

    try {
      const result = await cartService.addToCart(product, variant, quantity, isAuthenticated);
      
      if (!result.success) {
        setError(result.error || 'Failed to add to cart');
      } else if (result.cartItem) {
        // Upsert item into store so MiniCart reflects immediately
        const { items, setItems } = useHybridCartStore.getState();
        const idx = items.findIndex((i) => i.id === result.cartItem!.id);
        if (idx >= 0) {
          const updated = items.map((i) => (i.id === result.cartItem!.id ? result.cartItem! : i));
          setItems(updated);
        } else {
          setItems([result.cartItem, ...items]);
        }
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setOperation('');
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (
    itemId: string, 
    quantity: number
  ): Promise<CartOperationResult> => {
    setIsLoading(true);
    setOperation('updating');
    setError(null);

    try {
      const result = await cartService.updateQuantity(itemId, quantity, isAuthenticated);
      
      if (!result.success) {
        setError(result.error || 'Failed to update quantity');
        toast.error('Failed to update quantity', { description: result.error || 'Please try again.' });
      } else {
        // Update local store with new qty
        if (result.cartItem) {
          useHybridCartStore.getState().updateItemQuantity(itemId, result.cartItem.quantity);
        } else {
          useHybridCartStore.getState().updateItemQuantity(itemId, quantity);
        }
        toast.success('Quantity updated');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quantity';
      setError(errorMessage);
      toast.error('Failed to update quantity', { description: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setOperation('');
    }
  }, [isAuthenticated]);

  const removeItem = useCallback(async (itemId: string): Promise<CartOperationResult> => {
    setIsLoading(true);
    setOperation('removing');
    setError(null);

    try {
      const result = await cartService.removeItem(itemId, isAuthenticated);
      
      if (!result.success) {
        setError(result.error || 'Failed to remove item');
        toast.error('Failed to remove item', {
          description: result.error || 'Please try again.',
        });
      } else {
        // Reflect removal locally
        useHybridCartStore.getState().removeItem(itemId);
        toast.success('Item removed from cart');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
      setError(errorMessage);
      toast.error('Failed to remove item', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setOperation('');
    }
  }, [isAuthenticated]);

  const getCartItems = useCallback(async () => {
    setIsLoading(true);
    setOperation('loading');
    setError(null);

    try {
      const items = await cartService.getCartItems(isAuthenticated);
      return items;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cart items';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
      setOperation('');
    }
  }, [isAuthenticated]);

  const syncCartOnLogin = useCallback(async () => {
    setIsLoading(true);
    setOperation('syncing');
    setError(null);

    try {
      const result = await cartService.syncCartOnLogin();
      
      if (!result.success) {
        setError(result.error || 'Failed to sync cart');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setOperation('');
    }
  }, []);

  const syncCartOnLogout = useCallback(async () => {
    setIsLoading(true);
    setOperation('syncing');
    setError(null);

    try {
      const result = await cartService.syncCartOnLogout();
      
      if (!result.success) {
        setError(result.error || 'Failed to sync cart');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setOperation('');
    }
  }, []);

  return {
    addToCart,
    updateQuantity,
    removeItem,
    getCartItems,
    syncCartOnLogin,
    syncCartOnLogout,
    isLoading,
    operation,
    error,
    isAuthenticated,
    clearError: () => setError(null)
  };
}