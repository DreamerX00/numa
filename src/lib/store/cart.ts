"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MockProduct, MockProductVariant } from "@/mocks/fixtures/products";

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: MockProduct;
  variant: MockProductVariant;
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  addItem: (product: MockProduct, variant: MockProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant, quantity = 1) => {
        const existingItemIndex = get().items.findIndex(
          (item) => item.productId === product.id && item.variantId === variant.id
        );

        if (existingItemIndex > -1) {
          // Update existing item quantity
          set((state) => ({
            items: state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          }));
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${product.id}-${variant.id}-${Date.now()}`,
            productId: product.id,
            variantId: variant.id,
            quantity,
            product,
            variant,
            addedAt: new Date(),
          };
          set((state) => ({ items: [...state.items, newItem] }));
        }
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.variant.priceCents * item.quantity,
          0
        );
      },
    }),
    {
      name: "numa-cart",
    }
  )
);