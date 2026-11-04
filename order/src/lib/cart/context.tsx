'use client';

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { useStore } from 'zustand';
import { createCartStore, type CartStore } from './store';

const CartContext = createContext<CartStore | null>(null);

export function CartProvider({ tenantSlug, children }: { tenantSlug: string; children: React.ReactNode }) {
  const [store] = useState(() => createCartStore(tenantSlug));
  useEffect(() => {
    void store.persist.rehydrate();
  }, [store]);
  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

function useCartStore(): CartStore {
  const store = useContext(CartContext);
  if (!store) throw new Error('useCart must be used inside <CartProvider>');
  return store;
}

export function useCart<T>(selector: (s: ReturnType<CartStore['getState']>) => T): T {
  return useStore(useCartStore(), selector);
}

/** False until the persisted cart has loaded, so server and first client render match. */
export function useCartHydrated(): boolean {
  const store = useCartStore();
  return useSyncExternalStore(
    (cb) => store.persist.onFinishHydration(cb),
    () => store.persist.hasHydrated(),
    () => false,
  );
}
