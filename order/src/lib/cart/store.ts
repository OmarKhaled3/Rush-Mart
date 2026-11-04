'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartLine = {
  /** item + variant + sorted options; identical choices merge into one line. */
  key: string;
  itemId: string;
  variantId: string | null;
  optionIds: string[];
  quantity: number;
};

export type CustomerDetails = { name: string; phone: string };

type CartState = {
  lines: CartLine[];
  customer: CustomerDetails;
  /** Set when lines were removed because they are no longer available. Not persisted. */
  pruned: boolean;
  add: (line: Omit<CartLine, 'key'>) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  /** Keeps only the given line keys; flags `pruned` if anything was removed. */
  prune: (keepKeys: string[]) => void;
  clear: () => void;
  setCustomer: (customer: CustomerDetails) => void;
};

export const MAX_QUANTITY = 20;
export const MAX_LINES = 30;

export function lineKey(itemId: string, variantId: string | null, optionIds: string[]): string {
  return [itemId, variantId ?? '-', ...[...optionIds].sort()].join('|');
}

/**
 * One cart per tenant (keyed storage), persisted in localStorage. Prices are not stored:
 * the cart is always repriced against the live menu, and the database prices the order.
 */
export function createCartStore(tenantSlug: string) {
  return create<CartState>()(
    persist(
      (set) => ({
        lines: [],
        customer: { name: '', phone: '' },
        pruned: false,
        add: ({ itemId, variantId, optionIds, quantity }) =>
          set((s) => {
            const key = lineKey(itemId, variantId, optionIds);
            const existing = s.lines.find((l) => l.key === key);
            if (existing) {
              return {
                pruned: false,
                lines: s.lines.map((l) =>
                  l.key === key ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + quantity) } : l,
                ),
              };
            }
            if (s.lines.length >= MAX_LINES) return s;
            return { pruned: false, lines: [...s.lines, { key, itemId, variantId, optionIds: [...optionIds].sort(), quantity }] };
          }),
        setQuantity: (key, quantity) =>
          set((s) => ({
            lines:
              quantity <= 0
                ? s.lines.filter((l) => l.key !== key)
                : s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) } : l)),
          })),
        remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
        prune: (keepKeys) =>
          set((s) => {
            const keep = new Set(keepKeys);
            const lines = s.lines.filter((l) => keep.has(l.key));
            return lines.length === s.lines.length ? s : { lines, pruned: true };
          }),
        clear: () => set({ lines: [] }),
        setCustomer: (customer) => set({ customer }),
      }),
      {
        name: `rush-order:cart:${tenantSlug}`,
        version: 1,
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,
        partialize: (s) => ({ lines: s.lines, customer: s.customer }),
      },
    ),
  );
}

export type CartStore = ReturnType<typeof createCartStore>;
