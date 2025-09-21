"use client";

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/client';
import { cartService, type CartOperationResult } from '@/lib/services/cart';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '@/lib/types/product';

export function useCartService() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const addToCart = useCallback(async (
    product: Product, 
    variant: ProductVariant | null = null, 
    quantity: number = 1
  ): Promise<CartOperationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cartService.addToCart(product, variant, quantity, isAuthenticated);
      
      if (!result.success) {
        setError(result.error || 'Failed to add to cart');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (
    itemId: string, 
    quantity: number
  ): Promise<CartOperationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cartService.updateQuantity(itemId, quantity, isAuthenticated);
      
      if (!result.success) {
        setError(result.error || 'Failed to update quantity');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quantity';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const removeItem = useCallback(async (itemId: string): Promise<CartOperationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cartService.removeItem(itemId, isAuthenticated);
      
      if (!result.success) {
        setError(result.error || 'Failed to remove item');
        toast.error('Failed to remove item', {
          description: result.error || 'Please try again.',
        });
      } else {
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
    }
  }, [isAuthenticated]);

  const getCartItems = useCallback(async () => {
    setIsLoading(true);
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
    }
  }, [isAuthenticated]);

  const syncCartOnLogin = useCallback(async () => {
    setIsLoading(true);
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
    }
  }, []);

  const syncCartOnLogout = useCallback(async () => {
    setIsLoading(true);
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
    error,
    isAuthenticated,
    clearError: () => setError(null)
  };
}