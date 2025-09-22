"use client";

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/client';
import { cartService } from '@/lib/services/cart';
import { useHybridCartStore } from '@/lib/store/hybridCart';

export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { setItems, setLoading, setError } = useHybridCartStore();

  useEffect(() => {
    let prevUser: typeof user = null;

    const handleAuthChange = async () => {
      const currentUser = user;
      
      // User just logged in
      if (!prevUser && currentUser) {
        try {
          setLoading(true);
          setError(null);
          
          // Sync local cart to server
          const syncResult = await cartService.syncCartOnLogin();
          
          if (syncResult.success) {
            // Update store with merged items
            setItems(syncResult.mergedItems || []);
          } else {
            setError(syncResult.error || 'Failed to sync cart');
          }
        } catch (error) {
          console.error('Error syncing cart on login:', error);
          setError('Failed to sync cart');
        } finally {
          setLoading(false);
        }
      }
      
      // User just logged out
      if (prevUser && !currentUser) {
        try {
          setLoading(true);
          setError(null);
          
          // Sync server cart to local storage
          const syncResult = await cartService.syncCartOnLogout();
          
          if (syncResult.success) {
            // Update store with local items
            setItems(syncResult.mergedItems || []);
          } else {
            setError(syncResult.error || 'Failed to sync cart');
          }
        } catch (error) {
          console.error('Error syncing cart on logout:', error);
          setError('Failed to sync cart');
        } finally {
          setLoading(false);
        }
      }
      
      // Update previous user reference
      prevUser = currentUser;
    };

    handleAuthChange();
  }, [user, setItems, setLoading, setError]);

  // Load initial cart items based on auth state
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Only fetch from server if user is authenticated
        // Otherwise load from localStorage
        const items = await cartService.getCartItems(!!user);
        setItems(items);
      } catch (error) {
        console.error('Error loading cart items:', error);
        // Don't set error for authentication failures - just load empty cart
        if (error instanceof Error && !error.message.includes('401')) {
          setError('Failed to load cart');
        }
        // Fallback to empty cart
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCartItems();
  }, [user, setItems, setLoading, setError]);

  return <>{children}</>;
}