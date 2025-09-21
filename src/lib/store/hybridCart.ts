"use client";

import { create } from "zustand";
import type { CartItem } from "@/lib/types/product";

interface HybridCartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  setItems: (items: CartItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
}

export const useHybridCartStore = create<HybridCartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  setItems: (items) => set({ items }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  clearCart: () => set({ items: [], error: null }),

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => {
        const itemPrice = item.priceAtAdd;
        return total + itemPrice * item.quantity;
      },
      0
    );
  },

  // Local state updates for optimistic UI
  updateItemQuantity: (itemId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    }));
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId)
    }));
  },
}));