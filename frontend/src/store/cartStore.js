import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// NOTE: derived values (total/count) are computed in components via selectors
// instead of store getters. Zustand's `set` uses Object.assign, which collapses
// object-literal getters into static values after the first update — so getters
// on the state would go stale. Keeping the store as data + actions avoids that.

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const exists = get().items.find((i) => i.id === product.id);
        if (exists) {
          set({
            items: get().items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...product, quantity: 1 }] });
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      clearCart: () => set({ items: [] }),
    }),
    { name: 'valparaiso-cart', partialize: (state) => ({ items: state.items }) }
  )
);

// ─── Selectors / helpers (pure, derived from items) ──────────────────
export const selectCount = (state) =>
  state.items.reduce((n, i) => n + i.quantity, 0);

export const selectTotal = (state) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const formatCLP = (value) =>
  '$' + new Intl.NumberFormat('es-CL').format(value) + ' CLP';
