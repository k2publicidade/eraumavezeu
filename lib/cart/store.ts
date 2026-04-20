"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { applyComboDiscount, type Totals } from "./discount";
import type { CartItem, CartProduct } from "./types";

type CartState = {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  getTotals: () => Totals;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((it) => it.id === product.id);
          if (existing) {
            return {
              items: s.items.map((it) =>
                it.id === product.id
                  ? { ...it, quantity: it.quantity + quantity }
                  : it,
              ),
            };
          }
          return { items: [...s.items, { ...product, quantity }] };
        }),

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((it) => it.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((it) => it.id !== id)
              : s.items.map((it) =>
                  it.id === id ? { ...it, quantity } : it,
                ),
        })),

      clear: () => set({ items: [] }),

      getTotals: () => applyComboDiscount(get().items),
    }),
    {
      name: "eraumavezeu-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
