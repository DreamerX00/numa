"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductVariant, CartItem } from "@/lib/types/product";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant | null, quantity?: number) => void;
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
        const variantId = variant?.id || null;
        const existingItemIndex = get().items.findIndex(
          (item) => item.productId === product.id && item.variantId === variantId
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
          // Use variant price if available, otherwise product price
          const itemPrice = variant?.price || product.price;
          
          const newItem: CartItem = {
            id: `${product.id}-${variantId || 'main'}-${Date.now()}`,
            productId: product.id,
            variantId: variantId,
            quantity,
            product,
            variant,
            addedAt: new Date(),
            priceAtAdd: itemPrice,
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
          (total, item) => {
            // Use priceAtAdd (stored when item was added) for price consistency
            const itemPrice = item.priceAtAdd;
            return total + itemPrice * item.quantity;
          },
          0
        );
      },
    }),
    {
      name: "numa-cart",
    }
  )
);