import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null, // { code, type, value, discount_amount, coupon_id }

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

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
        } else {
          set({
            items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
          });
        }
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      clearCart: () => set({ items: [], coupon: null }),

      setCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

      // Selectores (funciones, NO getters de objeto — ver nota histórica del proyecto)
      getSubtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      getDiscount: () => get().coupon?.discount_amount ?? 0,
      getTotal: () => Math.max(0, get().getSubtotal() - get().getDiscount()),
      getCount: () => get().items.reduce((s, i) => s + i.quantity, 0),

      formatCLP: (amount) => '$' + new Intl.NumberFormat('es-CL').format(amount) + ' CLP',
    }),
    { name: 'vlrp-cart', partialize: (s) => ({ items: s.items, coupon: s.coupon }) }
  )
);

// Helper exportado para usos puntuales fuera de React.
export const formatCLP = (amount) =>
  '$' + new Intl.NumberFormat('es-CL').format(amount) + ' CLP';
